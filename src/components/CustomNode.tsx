'use client';

import { type NodeProps, Handle, Position } from '@xyflow/react';
import React, { memo, useCallback } from 'react';

import { useAppStore } from '@/store/store';

import type { CardNodeData, JsonValueType } from '@/utils/jsonToFlow';

/** Color map for type badges */
const typeColorMap: Record<JsonValueType, string> = {
  string: '#22c55e',
  number: '#3b82f6',
  boolean: '#ef4444',
  null: '#71717a',
  object: '#a855f7',
  array: '#f97316',
};

function CardNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as unknown as CardNodeData;
  const toggleNodeCollapse = useAppStore((s) => s.toggleNodeCollapse);
  const setHighlightedNode = useAppStore((s) => s.setHighlightedNode);
  const highlightedNode = useAppStore((s) => s.highlightedNode);
  const searchQuery = useAppStore((s) => s.searchQuery);

  const isHighlighted = highlightedNode === id;

  const handleCardClick = useCallback(() => {
    toggleNodeCollapse(nodeData.path);
  }, [nodeData.path, toggleNodeCollapse]);

  const matchesSearch = (text: string) =>
    searchQuery && text.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div
      className={`card-node ${isHighlighted ? 'card-highlighted' : ''}`}
      onMouseEnter={() => setHighlightedNode(id)}
      onMouseLeave={() => setHighlightedNode(null)}
      onClick={handleCardClick}
    >
      {/* Left input handle */}
      <Handle type='target' position={Position.Left} className='card-handle' />

      {/* Rows */}
      {nodeData.rows.map((row, idx) => {
        const isLinked = !!row.childNodeId;
        const isSearchMatch =
          matchesSearch(row.key) || matchesSearch(row.value);

        return (
          <div
            key={idx}
            className={`card-row ${
              isSearchMatch ? 'card-row-search-match' : ''
            }`}
          >
            <span className='card-row-key'>{row.key}:</span>
            <span
              className='card-row-value'
              style={{ color: typeColorMap[row.type] }}
            >
              {row.colorSwatch && (
                <span
                  className='color-swatch'
                  style={{ background: row.colorSwatch }}
                />
              )}
              {row.value}
            </span>

            {/* Per-row source handle for linked rows */}
            {isLinked && (
              <Handle
                type='source'
                position={Position.Right}
                id={`handle-${row.key}`}
                className='card-handle card-handle-row'
                style={{ top: `${idx * 28 + 20}px` }}
              />
            )}
          </div>
        );
      })}

      {/* If no linked rows, still provide a default source handle */}
      {!nodeData.rows.some((r) => r.childNodeId) && (
        <Handle
          type='source'
          position={Position.Right}
          className='card-handle'
        />
      )}
    </div>
  );
}

export const CardNode = memo(CardNodeComponent);
