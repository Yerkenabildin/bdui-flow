import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Boxes } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const ProxyNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<Boxes size={18} />} color="#F97316" />
))

ProxyNode.displayName = 'ProxyNode'
