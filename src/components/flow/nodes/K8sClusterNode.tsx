import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { Container } from 'lucide-react'
import { NodeData } from '../../../types'
import { useAnimationStore } from '../../../stores/animationStore'

export const K8sClusterNode = memo(({ id, data }: NodeProps<NodeData>) => {
  const activeNodeIds = useAnimationStore((s) => s.activeNodeIds)
  const isActive = activeNodeIds.includes(id)

  // Извлекаем паттерн из description (до тире)
  const pattern = data.description?.split('—')[0]?.trim() || ''

  return (
    <div
      className={`
        relative px-3 py-2 rounded-xl border-2 shadow-lg
        transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-xl
        bg-gradient-to-br from-blue-50 to-indigo-100
        ${isActive ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
      `}
      style={{
        borderColor: '#3B82F6',
        minWidth: '160px',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500"
      />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-500 text-white">
          <Container size={20} />
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-800">
            {data.label}
          </div>
          {pattern && (
            <div className="text-[10px] font-medium text-blue-600">
              {pattern}
            </div>
          )}
          {data.technology && (
            <div className="text-[10px] text-gray-400">
              {data.technology}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500"
      />
    </div>
  )
})

K8sClusterNode.displayName = 'K8sClusterNode'
