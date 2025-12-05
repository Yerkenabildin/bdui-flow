import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { Building2 } from 'lucide-react'
import { NodeData } from '../../../types'
import { useAnimationStore } from '../../../stores/animationStore'

export const DataCenterNode = memo(({ id, data }: NodeProps<NodeData>) => {
  const activeNodeIds = useAnimationStore((s) => s.activeNodeIds)
  const isActive = activeNodeIds.includes(id)

  // Извлекаем паттерн из description (до тире)
  const pattern = data.description?.split('—')[0]?.trim() || ''

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-xl
        transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-2xl
        bg-gradient-to-br from-slate-100 to-slate-200
        ${isActive ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
      `}
      style={{
        borderColor: '#64748B',
        minWidth: '160px',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-slate-500"
      />

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-600 text-white">
          <Building2 size={22} />
        </div>
        <div>
          <div className="font-bold text-sm text-gray-800">
            {data.label}
          </div>
          {pattern && (
            <div className="text-[10px] font-medium text-slate-600">
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
        className="!w-4 !h-4 !bg-slate-500"
      />

      {isActive && (
        <div className="absolute -inset-2 rounded-2xl bg-yellow-400 opacity-20 animate-ping" />
      )}
    </div>
  )
})

DataCenterNode.displayName = 'DataCenterNode'
