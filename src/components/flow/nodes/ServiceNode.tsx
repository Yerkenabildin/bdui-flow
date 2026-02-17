import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Server } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const ServiceNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<Server size={18} />} color="#6366F1" />
))

ServiceNode.displayName = 'ServiceNode'
