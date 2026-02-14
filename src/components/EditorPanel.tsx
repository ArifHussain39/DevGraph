'use client';

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/store';
import { useDebounce } from '@/hooks/useDebounce';
import { parseJSON, formatJSON } from '@/utils/jsonParser';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function EditorPanel() {
  const jsonString = useAppStore((s) => s.jsonString);
  const setJsonString = useAppStore((s) => s.setJsonString);
  const setParsedJson = useAppStore((s) => s.setParsedJson);
  const setJsonError = useAppStore((s) => s.setJsonError);
  const theme = useAppStore((s) => s.theme);
  const jsonError = useAppStore((s) => s.jsonError);
  const editorRef = useRef<unknown>(null);

  const debouncedJson = useDebounce(jsonString, 300);

  useEffect(() => {
    if (!debouncedJson.trim()) {
      setParsedJson(null);
      setJsonError(null);
      return;
    }
    const result = parseJSON(debouncedJson);
    if (result.error) {
      setJsonError(result.error);
      setParsedJson(null);
    } else {
      setJsonError(null);
      setParsedJson(result.data);
    }
  }, [debouncedJson, setParsedJson, setJsonError]);

  // Set error markers in Monaco
  useEffect(() => {
    const editor = editorRef.current as { getModel?: () => unknown } | null;
    if (!editor || typeof editor.getModel !== 'function') return;

    const model = editor.getModel() as {
      getLineCount: () => number;
      getLineMaxColumn: (line: number) => number;
    } | null;
    if (!model) return;

    // Access monaco from the window
    const monaco = (window as unknown as { monaco?: { editor: { setModelMarkers: (model: unknown, owner: string, markers: unknown[]) => void }; MarkerSeverity: { Error: number } } }).monaco;
    if (!monaco) return;

    if (jsonError && jsonError.line) {
      monaco.editor.setModelMarkers(model, 'json-validation', [
        {
          startLineNumber: jsonError.line,
          startColumn: jsonError.column || 1,
          endLineNumber: jsonError.line,
          endColumn: model.getLineMaxColumn(jsonError.line),
          message: jsonError.message,
          severity: monaco.editor.MarkerSeverity.Error,
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, 'json-validation', []);
    }
  }, [jsonError]);

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor;
  }, []);

  const handleFormat = useCallback(() => {
    const formatted = formatJSON(jsonString);
    setJsonString(formatted);
  }, [jsonString, setJsonString]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonString);
  }, [jsonString]);

  const handleClear = useCallback(() => {
    setJsonString('');
  }, [setJsonString]);

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 13,
      lineNumbers: 'on' as const,
      roundedSelection: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on' as const,
      formatOnPaste: true,
      automaticLayout: true,
      tabSize: 2,
      padding: { top: 12 },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
      suggestOnTriggerCharacters: false,
      quickSuggestions: false,
    }),
    []
  );

  return (
    <div className='editor-panel'>
      <div className='panel-toolbar'>
        <div className='panel-toolbar-left'>
          <span className='panel-title'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z' />
              <polyline points='13 2 13 9 20 9' />
            </svg>
            Editor
          </span>
          {jsonError && (
            <span className='error-indicator' title={jsonError.message}>
              ⚠ Error {jsonError.line ? `at line ${jsonError.line}` : ''}
            </span>
          )}
          {!jsonError && jsonString.trim() && (
            <span className='valid-indicator'>✓ Valid</span>
          )}
        </div>
        <div className='panel-toolbar-right'>
          <button className='toolbar-btn' onClick={handleCopy} title='Copy'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <rect x='9' y='9' width='13' height='13' rx='2' />
              <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
            </svg>
          </button>
          <button className='toolbar-btn' onClick={handleFormat} title='Format JSON'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <line x1='21' y1='10' x2='3' y2='10' />
              <line x1='21' y1='6' x2='3' y2='6' />
              <line x1='21' y1='14' x2='3' y2='14' />
              <line x1='21' y1='18' x2='3' y2='18' />
            </svg>
          </button>
          <button className='toolbar-btn' onClick={handleClear} title='Clear'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        </div>
      </div>
      <div className='editor-container'>
        <MonacoEditor
          height='100%'
          language='json'
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={jsonString}
          onChange={(v) => setJsonString(v || '')}
          onMount={handleEditorMount}
          options={editorOptions}
          loading={
            <div className='editor-loading'>Loading Editor...</div>
          }
        />
      </div>
    </div>
  );
}
