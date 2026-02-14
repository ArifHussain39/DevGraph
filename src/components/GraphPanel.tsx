'use client';

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '@/store/store';
import { jsonToFlow } from '@/utils/jsonToFlow';
import { CardNode } from '@/components/CustomNode';

const nodeTypes: NodeTypes = {
  cardNode: CardNode as unknown as NodeTypes['cardNode'],
};

export default function GraphPanel() {
  const parsedJson = useAppStore((s) => s.parsedJson);
  const collapsedNodes = useAppStore((s) => s.collapsedNodes);
  const theme = useAppStore((s) => s.theme);
  const graphRef = useRef<HTMLDivElement>(null);

  const { flowNodes, flowEdges } = useMemo(() => {
    if (!parsedJson) return { flowNodes: [], flowEdges: [] };
    const { nodes, edges } = jsonToFlow(parsedJson, collapsedNodes);
    return { flowNodes: nodes, flowEdges: edges };
  }, [parsedJson, collapsedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onInit = useCallback((instance: { fitView: (opts?: object) => void }) => {
    setTimeout(() => instance.fitView({ padding: 0.15 }), 150);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  if (!parsedJson) {
    return (
      <div className='graph-panel empty-state'>
        <div className='empty-state-content'>
          <div className='empty-state-icon'>
            <svg width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1' opacity='0.3'>
              <circle cx='5' cy='6' r='2' />
              <circle cx='12' cy='12' r='2' />
              <circle cx='19' cy='6' r='2' />
              <circle cx='12' cy='20' r='2' />
              <line x1='7' y1='6' x2='10' y2='10' />
              <line x1='17' y1='6' x2='14' y2='10' />
              <line x1='12' y1='14' x2='12' y2='18' />
            </svg>
          </div>
          <h3>No Data to Visualize</h3>
          <p>Paste or upload JSON in the editor, or load sample data to see the graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className='graph-panel' ref={graphRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        minZoom={0.05}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={proOptions}
        colorMode={theme}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={theme === 'dark' ? '#1e1e3f' : '#e5e7eb'}
        />
        <Controls className='graph-controls' />
        <MiniMap
          nodeStrokeWidth={3}
          className='graph-minimap'
          maskColor={theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(200,200,200,0.6)'}
        />
        <Panel position='top-right' className='graph-panel-controls'>
          <span className='node-count-badge'>
            {nodes.length} nodes · {edges.length} edges
          </span>
        </Panel>
      </ReactFlow>
    </div>
  );
}
