import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Smartphone } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const ClientNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<Smartphone size={18} />} color="#3B82F6" />
))

ClientNode.displayName = 'ClientNode'
