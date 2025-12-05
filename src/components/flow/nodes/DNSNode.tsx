import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Globe } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const DNSNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Globe size={20} />}
      color="#8B5CF6"
    />
  )
})

DNSNode.displayName = 'DNSNode'
