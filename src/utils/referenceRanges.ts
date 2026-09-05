import { LabStatus } from '../types/medical';

export interface EvaluationResult {
  status: LabStatus;
  explanation: string;
}

/**
 * Strictly evaluates a laboratory result against the source reference range.
 * 
 * CRITICAL SAFETY RULES:
 * 1. ONLY use reference ranges that are explicitly present in the uploaded/source report.
 * 2. NEVER invent reference ranges or use external standard defaults if missing.
 * 3. If a reference range is missing, returns "Cannot determine" with explanation:
 *    "Reference range not provided in source".
 */
export function evaluateLabValue(
  valueStr: string,
  referenceRangeStr: string | null | undefined
): EvaluationResult {
  // If no reference range was provided in the source report
  if (!referenceRangeStr || referenceRangeStr.trim() === '' || referenceRangeStr.toLowerCase().includes('not provided')) {
    return {
      status: 'Cannot determine',
      explanation: 'Reference range not provided in source'
    };
  }

  const cleanVal = valueStr.trim().replace(/,/g, '');
  const numericVal = parseFloat(cleanVal);

  if (isNaN(numericVal)) {
    return {
      status: 'Cannot determine',
      explanation: 'Non-numeric or qualitative result; qualitative interpretation requires clinical review'
    };
  }

  const range = referenceRangeStr.trim();

  // Pattern 1: Standard range "12.0 - 16.0" or "12.0 � 16.0" or "12 to 16"
  const rangeMatch = range.match(/([\d.]+)\s*(?:-|�|to)\s*([\d.]+)/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);

    if (!isNaN(low) && !isNaN(high)) {
      if (numericVal < low) {
        return {
          status: 'LOW',
          explanation: `Result (${numericVal}) is below the source lower limit (${low})`
        };
      } else if (numericVal > high) {
        return {
          status: 'HIGH',
          explanation: `Result (${numericVal}) is above the source upper limit (${high})`
        };
      } else {
        return {
          status: 'NORMAL',
          explanation: `Result (${numericVal}) is within source range (${low}�${high})`
        };
      }
    }
  }

  // Pattern 2: Upper bound only "< 200" or "<= 100" or "less than 200"
  const upperMatch = range.match(/(?:<|<=|less than)\s*([\d.]+)/i);
  if (upperMatch) {
    const threshold = parseFloat(upperMatch[1]);
    if (!isNaN(threshold)) {
      if (numericVal > threshold) {
        return {
          status: 'HIGH',
          explanation: `Result (${numericVal}) exceeds source threshold (${threshold})`
        };
      } else {
        return {
          status: 'NORMAL',
          explanation: `Result (${numericVal}) meets source target (< ${threshold})`
        };
      }
    }
  }

  // Pattern 3: Lower bound only "> 60" or ">= 30" or "greater than 30"
  const lowerMatch = range.match(/(?:>|>=|greater than)\s*([\d.]+)/i);
  if (lowerMatch) {
    const threshold = parseFloat(lowerMatch[1]);
    if (!isNaN(threshold)) {
      if (numericVal < threshold) {
        return {
          status: 'LOW',
          explanation: `Result (${numericVal}) is below source requirement (> ${threshold})`
        };
      } else {
        return {
          status: 'NORMAL',
          explanation: `Result (${numericVal}) meets source target (> ${threshold})`
        };
      }
    }
  }

  // If format couldn't be parsed safely, never guess
  return {
    status: 'Cannot determine',
    explanation: 'Source reference range format could not be parsed safely without manual review'
  };
}
