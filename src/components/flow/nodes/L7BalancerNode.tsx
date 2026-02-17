import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { GitBranch } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const L7BalancerNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<GitBranch size={18} />} color="#10B981" />
))

L7BalancerNode.displayName = 'L7BalancerNode'
