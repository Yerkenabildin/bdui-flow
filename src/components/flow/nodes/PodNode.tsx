import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Box } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const PodNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Box size={20} />}
      color="#A855F7"
    />
  )
})

PodNode.displayName = 'PodNode'
