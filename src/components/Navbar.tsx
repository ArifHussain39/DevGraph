'use client';

import { toPng, toSvg } from 'html-to-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAppStore } from '@/store/store';

import {
  generateGoStruct,
  generateJsonSchema,
  generateRustStruct,
  generateTypeScriptInterface,
} from '@/utils/codeGenerators';
import {
  jsonToCsv,
  jsonToYaml,
  xmlToJson,
  yamlToJson,
} from '@/utils/formatConverters';
import { SAMPLE_JSON_STRING } from '@/utils/sampleData';

function DropdownMenu({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='dropdown' ref={ref}>
      <button className='nav-btn' onClick={() => setOpen(!open)}>
        {icon}
        <span>{label}</span>
        <svg
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M6 9l6 6 6-6' />
        </svg>
      </button>
      {open && (
        <div className='dropdown-menu' onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const jsonString = useAppStore((s) => s.jsonString);
  const setJsonString = useAppStore((s) => s.setJsonString);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [codeGenResult, setCodeGenResult] = useState<{
    title: string;
    code: string;
  } | null>(null);
  const [conversionResult, setConversionResult] = useState<{
    title: string;
    code: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSample = useCallback(() => {
    setJsonString(SAMPLE_JSON_STRING);
  }, [setJsonString]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result;
        if (typeof text === 'string') setJsonString(text);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [setJsonString]
  );

  const handleFetchUrl = useCallback(async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    try {
      const res = await fetch(urlInput.trim());
      const text = await res.text();
      setJsonString(text);
      setShowUrlModal(false);
      setUrlInput('');
    } catch (err) {
      alert(
        'Failed to fetch URL: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setUrlLoading(false);
    }
  }, [urlInput, setJsonString]);

  // Export functions
  const handleExportPng = useCallback(() => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    toPng(el, {
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#ffffff',
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'devgraph-export.png';
      link.href = dataUrl;
      link.click();
    });
  }, [theme]);

  const handleExportSvg = useCallback(() => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    toSvg(el, {
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#ffffff',
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'devgraph-export.svg';
      link.href = dataUrl;
      link.click();
    });
  }, [theme]);

  const handleExportJson = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'data.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [jsonString]);

  // Format conversion
  const handleConversion = useCallback(
    async (type: string) => {
      try {
        let result: string;
        let title: string;
        switch (type) {
          case 'json-to-yaml':
            result = jsonToYaml(jsonString);
            title = 'YAML Output';
            break;
          case 'yaml-to-json':
            result = yamlToJson(jsonString);
            title = 'JSON Output';
            break;
          case 'json-to-csv':
            result = jsonToCsv(jsonString);
            title = 'CSV Output';
            break;
          case 'xml-to-json':
            result = await xmlToJson(jsonString);
            title = 'JSON from XML';
            break;
          default:
            return;
        }
        setConversionResult({ title, code: result });
      } catch (err) {
        alert(
          'Conversion failed: ' +
            (err instanceof Error ? err.message : 'Invalid input')
        );
      }
    },
    [jsonString]
  );

  // Code generation
  const handleCodeGen = useCallback(
    (type: string) => {
      try {
        let result: string;
        let title: string;
        switch (type) {
          case 'typescript':
            result = generateTypeScriptInterface(jsonString);
            title = 'TypeScript Interface';
            break;
          case 'json-schema':
            result = generateJsonSchema(jsonString);
            title = 'JSON Schema';
            break;
          case 'golang':
            result = generateGoStruct(jsonString);
            title = 'Go Struct';
            break;
          case 'rust':
            result = generateRustStruct(jsonString);
            title = 'Rust Struct';
            break;
          default:
            return;
        }
        setCodeGenResult({ title, code: result });
      } catch (err) {
        alert(
          'Generation failed: ' +
            (err instanceof Error ? err.message : 'Invalid JSON')
        );
      }
    },
    [jsonString]
  );

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-left'>
          <div className='logo'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <circle cx='6' cy='6' r='3' fill='var(--accent-primary)' />
              <circle cx='18' cy='6' r='3' fill='var(--accent-secondary)' />
              <circle cx='12' cy='18' r='3' fill='var(--accent-tertiary)' />
              <line
                x1='6'
                y1='9'
                x2='12'
                y2='15'
                stroke='var(--accent-primary)'
                strokeWidth='1.5'
              />
              <line
                x1='18'
                y1='9'
                x2='12'
                y2='15'
                stroke='var(--accent-secondary)'
                strokeWidth='1.5'
              />
            </svg>
            <span className='logo-text'>DevGraph</span>
          </div>

          <div className='nav-divider' />

          <DropdownMenu
            label='Import'
            icon={
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='7 10 12 15 17 10' />
                <line x1='12' y1='15' x2='12' y2='3' />
              </svg>
            }
          >
            <button className='dropdown-item' onClick={handleLoadSample}>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                <polyline points='14 2 14 8 20 8' />
                <line x1='16' y1='13' x2='8' y2='13' />
                <line x1='16' y1='17' x2='8' y2='17' />
              </svg>
              Load Sample JSON
            </button>
            <button
              className='dropdown-item'
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
              Upload File
            </button>
            <button
              className='dropdown-item'
              onClick={() => setShowUrlModal(true)}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
                <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
              </svg>
              Fetch from URL
            </button>
          </DropdownMenu>

          <DropdownMenu
            label='Export'
            icon={
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
            }
          >
            <button className='dropdown-item' onClick={handleExportPng}>
              📷 Export as PNG
            </button>
            <button className='dropdown-item' onClick={handleExportSvg}>
              🎨 Export as SVG
            </button>
            <button className='dropdown-item' onClick={handleExportJson}>
              📄 Download JSON
            </button>
          </DropdownMenu>

          <DropdownMenu
            label='Convert'
            icon={
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <polyline points='16 3 21 3 21 8' />
                <line x1='4' y1='20' x2='21' y2='3' />
                <polyline points='21 16 21 21 16 21' />
                <line x1='15' y1='15' x2='21' y2='21' />
                <line x1='4' y1='4' x2='9' y2='9' />
              </svg>
            }
          >
            <button
              className='dropdown-item'
              onClick={() => handleConversion('json-to-yaml')}
            >
              JSON → YAML
            </button>
            <button
              className='dropdown-item'
              onClick={() => handleConversion('yaml-to-json')}
            >
              YAML → JSON
            </button>
            <button
              className='dropdown-item'
              onClick={() => handleConversion('json-to-csv')}
            >
              JSON → CSV
            </button>
            <button
              className='dropdown-item'
              onClick={() => handleConversion('xml-to-json')}
            >
              XML → JSON
            </button>
          </DropdownMenu>

          <DropdownMenu
            label='Generate'
            icon={
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <polyline points='16 18 22 12 16 6' />
                <polyline points='8 6 2 12 8 18' />
              </svg>
            }
          >
            <button
              className='dropdown-item'
              onClick={() => handleCodeGen('typescript')}
            >
              TypeScript Interface
            </button>
            <button
              className='dropdown-item'
              onClick={() => handleCodeGen('json-schema')}
            >
              JSON Schema
            </button>
            <button
              className='dropdown-item'
              onClick={() => handleCodeGen('golang')}
            >
              Go Struct
            </button>
            <button
              className='dropdown-item'
              onClick={() => handleCodeGen('rust')}
            >
              Rust Struct
            </button>
          </DropdownMenu>
        </div>

        <div className='navbar-right'>
          <div className='search-bar'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <input
              type='text'
              placeholder='Search nodes...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='search-input'
            />
            {searchQuery && (
              <button
                className='search-clear'
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>

          <button
            className='nav-btn theme-toggle'
            onClick={toggleTheme}
            title='Toggle theme'
          >
            {theme === 'dark' ? (
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='5' />
                <line x1='12' y1='1' x2='12' y2='3' />
                <line x1='12' y1='21' x2='12' y2='23' />
                <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
                <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
                <line x1='1' y1='12' x2='3' y2='12' />
                <line x1='21' y1='12' x2='23' y2='12' />
                <line x1='4.22' y1='19.78' x2='5.64' y2='18.36' />
                <line x1='18.36' y1='5.64' x2='19.78' y2='4.22' />
              </svg>
            ) : (
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <input
        ref={fileInputRef}
        type='file'
        accept='.json,.txt,.yaml,.yml,.xml,.csv'
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* URL Import Modal */}
      {showUrlModal && (
        <div className='modal-overlay' onClick={() => setShowUrlModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Fetch JSON from URL</h3>
              <button
                className='modal-close'
                onClick={() => setShowUrlModal(false)}
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <input
                type='url'
                placeholder='https://api.example.com/data.json'
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className='modal-input'
                onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
              />
            </div>
            <div className='modal-footer'>
              <button
                className='btn-secondary'
                onClick={() => setShowUrlModal(false)}
              >
                Cancel
              </button>
              <button
                className='btn-primary'
                onClick={handleFetchUrl}
                disabled={urlLoading}
              >
                {urlLoading ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Generation Result Modal */}
      {codeGenResult && (
        <div className='modal-overlay' onClick={() => setCodeGenResult(null)}>
          <div
            className='modal modal-wide'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h3>{codeGenResult.title}</h3>
              <button
                className='modal-close'
                onClick={() => setCodeGenResult(null)}
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <pre className='code-output'>{codeGenResult.code}</pre>
            </div>
            <div className='modal-footer'>
              <button
                className='btn-primary'
                onClick={() => {
                  navigator.clipboard.writeText(codeGenResult.code);
                }}
              >
                Copy to Clipboard
              </button>
              <button
                className='btn-secondary'
                onClick={() => setCodeGenResult(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Result Modal */}
      {conversionResult && (
        <div
          className='modal-overlay'
          onClick={() => setConversionResult(null)}
        >
          <div
            className='modal modal-wide'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h3>{conversionResult.title}</h3>
              <button
                className='modal-close'
                onClick={() => setConversionResult(null)}
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <pre className='code-output'>{conversionResult.code}</pre>
            </div>
            <div className='modal-footer'>
              <button
                className='btn-primary'
                onClick={() => {
                  navigator.clipboard.writeText(conversionResult.code);
                }}
              >
                Copy to Clipboard
              </button>
              <button
                className='btn-primary'
                onClick={() => {
                  setJsonString(conversionResult.code);
                  setConversionResult(null);
                }}
              >
                Load in Editor
              </button>
              <button
                className='btn-secondary'
                onClick={() => setConversionResult(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
