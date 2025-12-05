import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Router } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const ApiGatewayNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Router size={20} />}
      color="#6366F1"
    />
  )
})

ApiGatewayNode.displayName = 'ApiGatewayNode'
