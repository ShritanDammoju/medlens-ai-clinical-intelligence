// Vercel Serverless Function: POST /api/chat
// Secure server-side execution with Google Gemini 3.8 Flash
// Server-only GEMINI_API_KEY (never exposed to browser clients)

export const maxDuration = 60; // Allow up to 60s execution limit for Vercel Serverless Functions

interface ChatRequestBody {
  message: string;
  conversationHistory?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  patientContext?: {
    patientName?: string;
    patientAge?: number;
    patientSex?: string;
    hasRecords?: boolean;
    reports?: Array<{ title: string; date: string; category?: string; extractedCount?: number }>;
    labs?: Array<{
      testName: string;
      originalTerm?: string;
      value: string;
      unit: string;
      refRange: string | null;
      status: string;
      date: string;
      source: string;
      verificationStatus?: string;
    }>;
    medications?: Array<{ name: string; dose: string; freq: string; source: string; verified?: string }>;
    conditions?: Array<{ name: string; status: string; source?: string }>;
    allergies?: Array<{ allergen: string; severity?: string; reaction?: string }>;
    conflicts?: Array<{ title: string; description: string; resolved: boolean }>;
    unverifiedCount?: number;
  };
  isDemo?: boolean;
  role?: 'patient' | 'doctor';
}

interface SourceItem {
  sourceName: string;
  testName?: string;
  value?: string;
  refRange?: string;
  status?: string;
}

const SYSTEM_INSTRUCTION = `You are the MedLens Clinical Information Intelligence Assistant.
MedLens is a clinical data synthesis platform designed to help patients and healthcare professionals understand and review structured medical records, laboratory parameters, and diagnostic reports with verified data lineage.

STRICT CLINICAL SAFETY AND ACCURACY RULES:
1. NON-DIAGNOSTIC MANDATE:
   - You MUST NOT diagnose diseases or clinical conditions (e.g. NEVER assert "you have diabetes", "you have iron-deficiency anemia", or "you are sick").
   - You MUST NOT prescribe medication, suggest starting/stopping drugs, or recommend dosage adjustments.
   - You MUST NOT provide treatment plans or claim definitive medical certainty.
   - Always encourage the user to discuss observations with a licensed physician or specialist.

2. REFERENCE RANGE FIDELITY:
   - Only cite reference intervals explicitly provided in the patient's structured records.
   - NEVER invent, generalize, or hallucinate standard population reference ranges. Analytical instruments and demographic normal limits vary by testing laboratory.
   - If a reference interval was not stated on the source report, explicitly declare: "The source report does not provide a reference range for this test."

3. UNCERTAINTY-AWARE PHRASING:
   Use clear, evidence-based language such as:
   - "Based on the records available in your MedLens profile..."
   - "Your report dated [date] documents a value of..."
   - "The laboratory's stated reference interval is..."
   - "There is a recorded discrepancy between these two documents..."
   - "I cannot determine the clinical cause from the available records."

4. ABSENCE OF INFORMATION:
   - If the user asks about data not present in the provided patient records (e.g., missing tests, unknown medications), clearly state:
     "I don't have that information in your MedLens record."
   - If the patient has no records or intake yet, politely encourage them to complete their intake form or upload a report.
   - NEVER make up lab values, doctors, medications, or historical dates.

5. DEMO DATA NOTICE:
   - If the request indicates Demo Mode is active, include a brief polite indicator: "[Demo Mode: Information shown is from simulated sample records]".

6. TONE AND FORMAT:
   - Patient-friendly, clear, compassionate, and precise.
   - Explain complex laboratory acronyms simply when asked (e.g., HbA1c, eGFR, CRP).
   - Answer directly and avoid excessive boilerplate.`;

/**
 * Safely parse incoming request body from multiple potential Vercel serverless formats.
 */
async function parseRequestBody(req: any): Promise<ChatRequestBody> {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body as ChatRequestBody;
    }
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString('utf-8'));
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : ({} as ChatRequestBody));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Executes fetch with transient error retry and exponential backoff to handle cold starts & TLS handshake delays.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);
      // Retry transient HTTP status codes (429 rate limit, 500, 502, 503, 504 gateway errors)
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < maxRetries) {
        const delayMs = 600 * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
        console.warn(`[api/chat] Gemini API returned transient HTTP ${response.status}. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempt++;
        continue;
      }
      return response;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        const delayMs = 600 * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
        console.warn(`[api/chat] Gemini API network fetch failed (${err?.message || err}). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempt++;
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('Failed to reach Gemini API after retries');
}

export default async function handler(req: any, res: any) {
  // CORS configuration for local development and Vercel domains
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in Vercel Project Settings or .env.local.',
      code: 'API_KEY_NOT_CONFIGURED',
      text: 'MedLens AI is temporarily unavailable because the server GEMINI_API_KEY is not configured. Your saved medical record remains securely available.'
    });
    return;
  }

  try {
    const body = await parseRequestBody(req);
    const { message, conversationHistory = [], patientContext, isDemo, role = 'patient' } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Valid "message" string is required.' });
      return;
    }

    // Guard against excessive message length
    const cleanMessage = message.trim().slice(0, 1000);

    // Format structured clinical context for Gemini
    let contextPrompt = '';
    if (!patientContext || !patientContext.hasRecords) {
      contextPrompt = `PATIENT CONTEXT:
Patient Name: ${patientContext?.patientName || 'Patient'}
Status: No medical reports or clinical intake records have been uploaded yet.
Instruction: Inform the patient that their MedLens record is currently empty, and they can complete their intake or upload a diagnostic report to enable detailed analysis.`;
    } else {
      contextPrompt = `PATIENT RECORD SUMMARY (CURRENT AUTHORIZED DATA):
Patient: ${patientContext.patientName || 'Patient'} (${patientContext.patientAge || 'Age not recorded'}y, ${patientContext.patientSex || 'Sex not recorded'})
Role viewing: ${role === 'doctor' ? 'Authorized Clinician Reviewer' : 'Patient'}
Demo Mode: ${isDemo ? 'YES (Simulated Dataset)' : 'NO (Real Authenticated Record)'}

UPLOADED REPORTS (${patientContext.reports?.length || 0}):
${(patientContext.reports || []).map(r => `• "${r.title}" (Date: ${r.date}, Category: ${r.category || 'General'}, Extracted items: ${r.extractedCount || 0})`).join('\n') || 'None'}

LABORATORY RESULTS & BIOMARKERS (${patientContext.labs?.length || 0}):
${(patientContext.labs || []).map(l => 
  `• ${l.testName}${l.originalTerm && l.originalTerm !== l.testName ? ` [Source term: "${l.originalTerm}"]` : ''}: ${l.value} ${l.unit} | Source Ref Range: ${l.refRange ? `[${l.refRange} ${l.unit}]` : 'Not provided by lab'} | Status: ${l.status} | Date: ${l.date} | Report: "${l.source}" | Verification: ${l.verificationStatus || 'unverified'}`
).join('\n') || 'None recorded'}

ACTIVE MEDICATIONS (${patientContext.medications?.length || 0}):
${(patientContext.medications || []).map(m => `• ${m.name} (Dose: ${m.dose}, Frequency: ${m.freq}, Source: "${m.source}")`).join('\n') || 'None recorded'}

KNOWN ALLERGIES:
${(patientContext.allergies || []).map(a => `• ${a.allergen} (${a.severity || 'Unspecified'} severity${a.reaction ? `, Reaction: ${a.reaction}` : ''})`).join('\n') || 'None recorded'}

EXISTING CONDITIONS:
${(patientContext.conditions || []).map(c => `• ${c.name} (${c.status})`).join('\n') || 'None recorded'}

CROSS-RECORD CONFLICTS (${patientContext.conflicts?.length || 0}):
${(patientContext.conflicts || []).map(c => `• ${c.title}: ${c.description} [Status: ${c.resolved ? 'Resolved' : 'Pending Review'}]`).join('\n') || 'None detected'}`;
    }

    // Build Gemini multi-turn contents array with conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Limit conversation history to the most recent 6 messages to preserve context token budget
    const recentHistory = conversationHistory.slice(-6);

    if (recentHistory.length > 0) {
      // First turn pairs patient clinical context with first message
      const firstMsg = recentHistory[0];
      contents.push({
        role: firstMsg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: `[PATIENT CLINICAL RECORD CONTEXT]\n${contextPrompt}\n\n[USER QUESTION]\n${firstMsg.text}` }]
      });

      for (let i = 1; i < recentHistory.length; i++) {
        const item = recentHistory[i];
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }

      // Add current user prompt
      contents.push({
        role: 'user',
        parts: [{ text: cleanMessage }]
      });
    } else {
      // First single turn
      contents.push({
        role: 'user',
        parts: [{ text: `[PATIENT CLINICAL RECORD CONTEXT]\n${contextPrompt}\n\n[USER QUESTION]\n${cleanMessage}` }]
      });
    }

    // Target production Gemini model: gemini-3.8-flash (with customizable env override)
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents,
      generationConfig: {
        temperature: 0.3,
        topP: 0.85,
        maxOutputTokens: 1024
      }
    };

    const response = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    }, 2);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[api/chat] Gemini API returned error status ${response.status}:`, errorText);
      res.status(502).json({
        error: `Gemini API responded with status ${response.status}`,
        details: errorText,
        text: 'MedLens AI encountered a temporary issue communicating with the generative model. Your medical records remain intact and secure.'
      });
      return;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      res.status(500).json({
        error: 'No text was returned by the generative model.',
        text: 'Unable to formulate an answer from the clinical records at this moment.'
      });
      return;
    }

    // Extract relevant source citations based on the response content and patient labs
    const relevantSources: SourceItem[] = [];
    if (patientContext?.labs) {
      for (const lab of patientContext.labs) {
        const lowerRes = candidateText.toLowerCase();
        if (
          lowerRes.includes(lab.testName.toLowerCase()) || 
          (lab.originalTerm && lowerRes.includes(lab.originalTerm.toLowerCase()))
        ) {
          if (!relevantSources.some(s => s.testName === lab.testName)) {
            relevantSources.push({
              sourceName: lab.source,
              testName: lab.testName,
              value: `${lab.value} ${lab.unit}`,
              refRange: lab.refRange ? `${lab.refRange} ${lab.unit}` : 'Not provided in source',
              status: lab.status
            });
          }
        }
      }
    }

    res.status(200).json({
      text: candidateText,
      sources: relevantSources.slice(0, 4), // Cap at top 4 relevant source tags
      modelUsed: modelName,
      isDemo: Boolean(isDemo),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err: any) {
    console.error('API /api/chat error:', err);
    res.status(500).json({
      error: err?.message || 'Internal server error processing clinical question.',
      text: 'An unexpected error occurred while processing your request. Please try again.'
    });
  }
}
