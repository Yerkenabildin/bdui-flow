import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Boxes } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const ServiceNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Boxes size={20} />}
      color="#EC4899"
    />
  )
})

ServiceNode.displayName = 'ServiceNode'

export const IngressNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Boxes size={20} />}
      color="#8B5CF6"
    />
  )
})

IngressNode.displayName = 'IngressNode'
