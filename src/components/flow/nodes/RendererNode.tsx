import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Layers } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const RendererNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<Layers size={18} />} color="#F43F5E" />
))

RendererNode.displayName = 'RendererNode'
