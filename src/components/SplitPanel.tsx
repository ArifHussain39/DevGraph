'use client';

import React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import EditorPanel from '@/components/EditorPanel';
import dynamic from 'next/dynamic';

const GraphPanel = dynamic(() => import('@/components/GraphPanel'), { ssr: false });

export default function SplitPanel() {
  return (
    <Group orientation='horizontal' className='split-panel'>
      <Panel defaultSize={35} minSize={20} className='split-panel-left'>
        <EditorPanel />
      </Panel>
      <Separator className='resize-handle'>
        <div className='resize-handle-bar' />
      </Separator>
      <Panel defaultSize={65} minSize={30} className='split-panel-right'>
        <GraphPanel />
      </Panel>
    </Group>
  );
}
