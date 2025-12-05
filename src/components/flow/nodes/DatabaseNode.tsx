import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { HardDrive } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const DatabaseNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<HardDrive size={20} />}
      color="#0EA5E9"
    />
  )
})

DatabaseNode.displayName = 'DatabaseNode'
