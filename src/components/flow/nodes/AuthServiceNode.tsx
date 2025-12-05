import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Shield } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeData } from '../../../types'

export const AuthServiceNode = memo(({ id, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode
      id={id}
      data={data}
      icon={<Shield size={20} />}
      color="#14B8A6"
    />
  )
})

AuthServiceNode.displayName = 'AuthServiceNode'
