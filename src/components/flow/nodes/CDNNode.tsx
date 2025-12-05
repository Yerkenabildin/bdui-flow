import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Zap } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const CDNNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Zap size={20} />}
      color="#F59E0B"
    />
  )
})

CDNNode.displayName = 'CDNNode'
