export interface ParseError {
  message: string;
  line?: number;
  column?: number;
}

export interface ParseResult {
  data: unknown | null;
  error: ParseError | null;
}

/**
 * Safely parse a JSON string, returning parsed data and error info.
 */
export function parseJSON(input: string): ParseResult {
  if (!input.trim()) {
    return { data: null, error: null };
  }

  try {
    const data = JSON.parse(input);
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON';
    const posMatch = message.match(/position\s+(\d+)/i);
    let line: number | undefined;
    let column: number | undefined;

    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = input.substring(0, pos).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return { data: null, error: { message, line, column } };
  }
}

/**
 * Pretty print JSON string.
 */
export function formatJSON(input: string): string {
  try {
    const data = JSON.parse(input);
    return JSON.stringify(data, null, 2);
  } catch {
    return input;
  }
}

/**
 * Validate JSON string.
 */
export function validateJSON(input: string): { valid: boolean; error: ParseError | null } {
  if (!input.trim()) {
    return { valid: true, error: null };
  }
  const result = parseJSON(input);
  return { valid: result.error === null, error: result.error };
}
