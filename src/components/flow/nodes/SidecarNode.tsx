import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Network } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const SidecarNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Network size={20} />}
      color="#06B6D4"
    />
  )
})

SidecarNode.displayName = 'SidecarNode'
