import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Network } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const L3BalancerNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<Network size={18} />} color="#A855F7" />
))

L3BalancerNode.displayName = 'L3BalancerNode'
