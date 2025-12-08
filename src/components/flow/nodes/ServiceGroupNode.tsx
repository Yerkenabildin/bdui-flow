import { memo } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { Boxes } from 'lucide-react'
import { NodeData } from '../../../types'
import { useAnimationStore } from '../../../stores/animationStore'

export const ServiceGroupNode = memo(({ id, data }: NodeProps<NodeData>) => {
  const activeNodeIds = useAnimationStore((s) => s.activeNodeIds)
  const currentStepType = useAnimationStore((s) => s.currentStepType)
  const isActive = activeNodeIds.includes(id)

  const color = '#EC4899' // Pink for services

  const activeRingColor = currentStepType === 'request' ? '#3b82f6'
    : currentStepType === 'response' ? '#22c55e'
    : currentStepType === 'async' ? '#f97316'
    : '#fbbf24'

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg
        transition-all duration-300
      `}
      style={{
        backgroundColor: `${color}08`,
        borderColor: isActive ? activeRingColor : `${color}40`,
        borderStyle: 'dashed',
        width: data.width || 280,
        height: data.height || 120,
        boxShadow: isActive ? `0 0 20px ${activeRingColor}50` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3"
        style={{ backgroundColor: color, top: '50%' }}
      />

      {/* Header */}
      <div
        className="absolute -top-3 left-3 px-2 py-0.5 rounded-md flex items-center gap-1.5"
        style={{ backgroundColor: color }}
      >
        <Boxes size={12} className="text-white" />
        <span className="text-white text-xs font-semibold">{data.label}</span>
      </div>

      {/* Technology badge */}
      {data.technology && (
        <div className="absolute -top-3 right-3 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px]">
          {data.technology}
        </div>
      )}

      {/* Description at bottom */}
      {data.description && (
        <div
          className="absolute bottom-1 left-2 right-2 text-[9px] text-gray-400 truncate"
        >
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3"
        style={{ backgroundColor: color, top: '50%' }}
      />

      {/* Active animation ring */}
      {isActive && (
        <div
          className="absolute -inset-1 rounded-xl animate-pulse"
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${activeRingColor}`,
            opacity: 0.6,
          }}
        />
      )}
    </div>
  )
})

ServiceGroupNode.displayName = 'ServiceGroupNode'
