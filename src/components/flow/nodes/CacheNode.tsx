import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Database } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const CacheNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Database size={20} />}
      color="#EF4444"
    />
  )
})

CacheNode.displayName = 'CacheNode'
