import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nodeTypes } from './nodes'
import { nodes as archNodes, edges as archEdges } from '../../data/bduiArchitecture'
import { useNodeInfoStore } from '../../stores/nodeInfoStore'
import { BduiNodeType } from '../../types'

const miniMapColors: Record<string, string> = {
  client: '#3B82F6',
  l3Balancer: '#A855F7',
  l7Balancer: '#10B981',
  apiGateway: '#06B6D4',
  proxy: '#F97316',
  service: '#6366F1',
  renderer: '#F43F5E',
}

function FlowCanvasInner() {
  const initialNodes = useMemo(() => archNodes, [])
  const initialEdges = useMemo(() => archEdges, [])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const selectNode = useNodeInfoStore((s) => s.selectNode)

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    selectNode({
      id: node.id,
      type: node.type as BduiNodeType,
      data: node.data,
    })
  }, [selectNode])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls className="!bg-white !shadow-lg !rounded-lg !border !border-gray-200" />
        <MiniMap
          className="!bg-white !shadow-lg !rounded-lg !border !border-gray-200"
          nodeColor={(node) => miniMapColors[node.type || ''] || '#94a3b8'}
          maskColor="rgba(0, 0, 0, 0.08)"
        />
      </ReactFlow>
    </div>
  )
}

export default function FlowCanvas() {
  return <FlowCanvasInner />
}
