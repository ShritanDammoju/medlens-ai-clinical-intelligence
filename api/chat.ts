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
 * High-performance Gemini Client with keep-alive connection reuse and fast exponential backoff.
 */
class GeminiClient {
  readonly apiKey: string;
  readonly modelName: string;
  readonly endpoint: string;

  constructor(apiKey: string, modelName: string = 'gemini-3.8-flash') {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
  }

  async generateContent(
    contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
    systemInstruction: string,
    maxRetries: number = 2
  ): Promise<{ text: string; modelUsed: string }> {
    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        topP: 0.85,
        maxOutputTokens: 800
      }
    };

    const bodyJson = JSON.stringify(payload);
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      // Fast per-attempt timeout of 12 seconds for Gemini 3.8 Flash
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive'
          },
          body: bodyJson,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        // Fail-fast on non-retryable 4xx client errors (400 invalid argument, 401 invalid key, 403 forbidden)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const errText = await response.text();
          throw new Error(`Gemini client error HTTP ${response.status}: ${errText}`);
        }

        // Transient status codes eligible for retry: 429 rate limit, 500, 502, 503, 504
        if ([429, 500, 502, 503, 504].includes(response.status)) {
          if (attempt < maxRetries) {
            // Fast exponential backoff: 250ms on first retry, 500ms on second retry
            const delayMs = 250 * Math.pow(2, attempt) + Math.floor(Math.random() * 50);
            console.warn(`[GeminiClient] Transient HTTP ${response.status}. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise(r => setTimeout(r, delayMs));
            attempt++;
            continue;
          }
          const errText = await response.text();
          throw new Error(`Gemini server error HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error('No candidate text returned by Gemini.');
        }

        return { text: candidateText, modelUsed: this.modelName };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        // If non-retryable client error, throw immediately
        if (err?.message?.includes('Gemini client error HTTP')) {
          throw err;
        }

        // Retry transient network errors or socket timeouts
        if (attempt < maxRetries) {
          const delayMs = 250 * Math.pow(2, attempt) + Math.floor(Math.random() * 50);
          console.warn(`[GeminiClient] Network error (${err?.message || err}). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, delayMs));
          attempt++;
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error('Failed to generate response from Gemini after retries.');
  }
}

// Module-level cached client singleton across warm container invocations
let cachedClient: GeminiClient | null = null;
let cachedKey: string = '';
let cachedModel: string = '';

function getGeminiClient(): GeminiClient {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  if (!cachedClient || cachedKey !== apiKey || cachedModel !== modelName) {
    cachedClient = new GeminiClient(apiKey, modelName);
    cachedKey = apiKey;
    cachedModel = modelName;
  }
  return cachedClient;
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

    // Build compact clinical context
    let contextPrompt = '';
    if (!patientContext || !patientContext.hasRecords) {
      contextPrompt = `PATIENT CONTEXT:
Patient: ${patientContext?.patientName || 'Patient'}
Status: No medical records uploaded yet.
Instruction: Inform the patient that their MedLens profile is currently empty and encourage them to complete intake or upload diagnostic reports.`;
    } else {
      const reportsSummary = (patientContext.reports || [])
        .slice(0, 5)
        .map(r => `"${r.title}" (${r.date})`)
        .join(', ') || 'None';

      const labsList = (patientContext.labs || [])
        .slice(0, 10)
        .map(l => {
          const ref = l.refRange ? `[Ref: ${l.refRange} ${l.unit}]` : '[Ref: Not stated in source]';
          const flag = l.status && l.status !== 'NORMAL' ? ` [${l.status}]` : '';
          return `• ${l.testName}: ${l.value} ${l.unit} ${ref}${flag} (Report: "${l.source}")`;
        })
        .join('\n') || 'None recorded';

      const medsSummary = (patientContext.medications || [])
        .slice(0, 6)
        .map(m => `• ${m.name} (${m.dose}, ${m.freq})`)
        .join('\n') || 'None recorded';

      const conflictsSummary = (patientContext.conflicts || [])
        .filter(c => !c.resolved)
        .slice(0, 3)
        .map(c => `• ${c.title}: ${c.description}`)
        .join('\n') || 'None';

      contextPrompt = `PATIENT RECORD (AUTHORIZED SUMMARY):
Patient: ${patientContext.patientName || 'Patient'} (${patientContext.patientAge || 'Age unrecorded'}y, ${patientContext.patientSex || 'Sex unrecorded'})
Role viewing: ${role === 'doctor' ? 'Authorized Clinician Reviewer' : 'Patient'}
Demo Mode: ${isDemo ? 'YES (Simulated Dataset)' : 'NO (Real Authenticated Record)'}
Uploaded Documents: ${reportsSummary}

KEY LABORATORY FINDINGS:
${labsList}

ACTIVE MEDICATIONS:
${medsSummary}

UNRESOLVED CONFLICTS:
${conflictsSummary}`;
    }

    // Limit conversation history to the most recent 4 messages to preserve speed and token budget
    const recentHistory = conversationHistory.slice(-4);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (recentHistory.length > 0) {
      // First turn pairs patient clinical context with first message
      const firstMsg = recentHistory[0];
      contents.push({
        role: firstMsg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: `[PATIENT CLINICAL RECORD CONTEXT]\n${contextPrompt}\n\n[USER QUESTION]\n${firstMsg.text.slice(0, 400)}` }]
      });

      for (let i = 1; i < recentHistory.length; i++) {
        const item = recentHistory[i];
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.sender === 'assistant' ? item.text.slice(0, 250) : item.text.slice(0, 400) }]
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

    // Call persistent Gemini 3.8 Flash Client
    const client = getGeminiClient();
    const { text: candidateText, modelUsed } = await client.generateContent(
      contents,
      SYSTEM_INSTRUCTION,
      2
    );

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
      modelUsed,
      isDemo: Boolean(isDemo),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err: any) {
    console.error('[api/chat] Error processing question:', err);
    res.status(500).json({
      error: err?.message || 'Internal server error processing clinical question.',
      text: 'MedLens AI encountered a temporary issue while communicating with the generative model. Your medical records remain intact and secure.'
    });
  }
}
