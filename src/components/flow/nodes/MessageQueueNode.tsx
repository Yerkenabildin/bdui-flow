import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { MessageSquare } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const MessageQueueNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<MessageSquare size={20} />}
      color="#F97316"
    />
  )
})

MessageQueueNode.displayName = 'MessageQueueNode'
