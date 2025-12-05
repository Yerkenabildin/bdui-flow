import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Gauge } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const RateLimiterNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Gauge size={20} />}
      color="#F97316"
    />
  )
})

RateLimiterNode.displayName = 'RateLimiterNode'
