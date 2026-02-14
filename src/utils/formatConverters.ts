import yaml from 'js-yaml';

/**
 * Convert JSON string to YAML string.
 */
export function jsonToYaml(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  return yaml.dump(data, { indent: 2, lineWidth: -1 });
}

/**
 * Convert YAML string to JSON string.
 */
export function yamlToJson(yamlStr: string): string {
  const data = yaml.load(yamlStr);
  return JSON.stringify(data, null, 2);
}

/**
 * Flatten nested JSON to a 2D table and convert to CSV.
 */
export function jsonToCsv(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const rows: Record<string, string>[] = [];

  function flatten(obj: unknown, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(
        obj as Record<string, unknown>
      )) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(result, flatten(value, newKey));
        } else if (Array.isArray(value)) {
          result[newKey] = JSON.stringify(value);
        } else {
          result[newKey] = String(value ?? '');
        }
      }
    }
    return result;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      rows.push(flatten(item));
    }
  } else {
    rows.push(flatten(data));
  }

  if (rows.length === 0) return '';

  const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const csvLines: string[] = [headers.map(escapeCsv).join(',')];

  for (const row of rows) {
    const line = headers.map((h) => escapeCsv(row[h] ?? '')).join(',');
    csvLines.push(line);
  }

  return csvLines.join('\n');
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert XML string to JSON string using fast-xml-parser.
 */
export async function xmlToJson(xmlStr: string): Promise<string> {
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const result = parser.parse(xmlStr);
  return JSON.stringify(result, null, 2);
}
