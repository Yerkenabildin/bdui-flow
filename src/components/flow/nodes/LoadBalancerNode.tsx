import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { GitBranch } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const GlobalLbNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<GitBranch size={20} />}
      color="#10B981"
    />
  )
})

GlobalLbNode.displayName = 'GlobalLbNode'

export const RegionalLbNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<GitBranch size={20} />}
      color="#059669"
    />
  )
})

RegionalLbNode.displayName = 'RegionalLbNode'
