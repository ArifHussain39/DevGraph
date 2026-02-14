/**
 * Code generation utilities: TypeScript interfaces, JSON Schema, Go structs, Rust structs.
 */

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toTypeName(key: string): string {
  return capitalize(
    key
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  );
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(capitalize)
    .join('');
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

// ==================== TypeScript Interface ====================

export function generateTypeScriptInterface(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const interfaces: string[] = [];
  generateTSInterface(data, 'Root', interfaces);
  return interfaces.join('\n\n');
}

function getTSType(value: unknown, key: string, interfaces: string[]): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const itemType = getTSType(value[0], key, interfaces);
    return `${itemType}[]`;
  }
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object': {
      const typeName = toTypeName(key);
      generateTSInterface(
        value as Record<string, unknown>,
        typeName,
        interfaces
      );
      return typeName;
    }
    default:
      return 'unknown';
  }
}

function generateTSInterface(
  obj: unknown,
  name: string,
  interfaces: string[]
): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

  const lines: string[] = [`export interface ${name} {`];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const tsType = getTSType(value, key, interfaces);
    const nullable = value === null ? ' | null' : '';
    lines.push(`  ${key}: ${tsType}${nullable};`);
  }
  lines.push('}');
  interfaces.push(lines.join('\n'));
}

// ==================== JSON Schema ====================

export function generateJsonSchema(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const schema = toJsonSchema(data);
  return JSON.stringify(
    { $schema: 'http://json-schema.org/draft-07/schema#', ...schema },
    null,
    2
  );
}

function toJsonSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length > 0 ? toJsonSchema(value[0]) : {},
    };
  }
  switch (typeof value) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'object': {
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(
        value as Record<string, unknown>
      )) {
        properties[key] = toJsonSchema(val);
        if (val !== null && val !== undefined) {
          required.push(key);
        }
      }
      return { type: 'object', properties, required };
    }
    default:
      return {};
  }
}

// ==================== Golang Struct ====================

export function generateGoStruct(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const structs: string[] = ['package main', ''];
  generateGoStructDef(data, 'Root', structs);
  return structs.join('\n');
}

function getGoType(value: unknown, key: string, structs: string[]): string {
  if (value === null) return 'interface{}';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]interface{}';
    const itemType = getGoType(value[0], key, structs);
    return `[]${itemType}`;
  }
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return Number.isInteger(value) ? 'int' : 'float64';
    case 'boolean':
      return 'bool';
    case 'object': {
      const typeName = toPascalCase(key);
      generateGoStructDef(value as Record<string, unknown>, typeName, structs);
      return typeName;
    }
    default:
      return 'interface{}';
  }
}

function generateGoStructDef(
  obj: unknown,
  name: string,
  structs: string[]
): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

  const lines: string[] = [`type ${name} struct {`];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const goType = getGoType(value, key, structs);
    const fieldName = toPascalCase(key);
    lines.push(`\t${fieldName} ${goType} \`json:"${key}"\``);
  }
  lines.push('}');
  structs.push(lines.join('\n'));
  structs.push('');
}

// ==================== Rust Struct ====================

export function generateRustStruct(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const structs: string[] = ['use serde::{Deserialize, Serialize};', ''];
  generateRustStructDef(data, 'Root', structs);
  return structs.join('\n');
}

function getRustType(value: unknown, key: string, structs: string[]): string {
  if (value === null) return 'Option<serde_json::Value>';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Vec<serde_json::Value>';
    const itemType = getRustType(value[0], key, structs);
    return `Vec<${itemType}>`;
  }
  switch (typeof value) {
    case 'string':
      return 'String';
    case 'number':
      return Number.isInteger(value) ? 'i64' : 'f64';
    case 'boolean':
      return 'bool';
    case 'object': {
      const typeName = toPascalCase(key);
      generateRustStructDef(
        value as Record<string, unknown>,
        typeName,
        structs
      );
      return typeName;
    }
    default:
      return 'serde_json::Value';
  }
}

function generateRustStructDef(
  obj: unknown,
  name: string,
  structs: string[]
): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

  const lines: string[] = [
    '#[derive(Debug, Clone, Serialize, Deserialize)]',
    `pub struct ${name} {`,
  ];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const rustType = getRustType(value, key, structs);
    const fieldName = toSnakeCase(key);
    if (fieldName !== key) {
      lines.push(`    #[serde(rename = "${key}")]`);
    }
    lines.push(`    pub ${fieldName}: ${rustType},`);
  }
  lines.push('}');
  structs.push(lines.join('\n'));
  structs.push('');
}
