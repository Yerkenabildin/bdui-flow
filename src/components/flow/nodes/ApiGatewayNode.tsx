import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Shield } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { BduiNodeData } from '../../../types'

export const ApiGatewayNode = memo(({ id, data }: NodeProps<BduiNodeData>) => (
  <BaseNode id={id} data={data} icon={<Shield size={18} />} color="#06B6D4" />
))

ApiGatewayNode.displayName = 'ApiGatewayNode'
