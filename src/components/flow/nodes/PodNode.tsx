import { memo } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { Box, Network } from 'lucide-react'
import { NodeData } from '../../../types'
import { useAnimationStore } from '../../../stores/animationStore'

export const PodNode = memo(({ id, data }: NodeProps<NodeData>) => {
  const activeNodeIds = useAnimationStore((s) => s.activeNodeIds)
  const currentStepType = useAnimationStore((s) => s.currentStepType)
  const isActive = activeNodeIds.includes(id)

  const color = '#A855F7' // Purple for pods

  const activeRingColor = currentStepType === 'request' ? '#3b82f6'
    : currentStepType === 'response' ? '#22c55e'
    : currentStepType === 'async' ? '#f97316'
    : '#fbbf24'

  // Check if this pod is inside a parent (compact mode)
  const isChild = !!data.parentId

  if (isChild) {
    // Compact version for pods inside service groups
    return (
      <div
        className={`
          relative px-2 py-1.5 rounded-lg border-2 shadow-md
          transition-all duration-300 cursor-pointer
          hover:scale-105
        `}
        style={{
          backgroundColor: `${color}15`,
          borderColor: isActive ? activeRingColor : color,
          minWidth: '70px',
          boxShadow: isActive ? `0 0 15px ${activeRingColor}50` : undefined,
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2"
          style={{ backgroundColor: color }}
        />

        <div className="flex items-center gap-1.5">
          <div
            className="p-1 rounded flex-shrink-0 relative"
            style={{ backgroundColor: `${color}30`, color }}
          >
            <Box size={14} />
            {isActive && (
              <div
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: activeRingColor }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-gray-700">Pod</span>
            {/* Sidecar badge */}
            <div className="flex items-center gap-0.5">
              <Network size={8} className="text-cyan-500" />
              <span className="text-[8px] text-cyan-600">sidecar</span>
            </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2"
          style={{ backgroundColor: color }}
        />

        {isActive && (
          <div
            className="absolute -inset-0.5 rounded-lg animate-pulse"
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${activeRingColor}`,
              opacity: 0.6,
            }}
          />
        )}
      </div>
    )
  }

  // Full version for standalone pods (backwards compatibility)
  return (
    <div
      className={`
        relative px-3 py-2 rounded-lg border-2 shadow-lg
        transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-xl
      `}
      style={{
        backgroundColor: `${color}15`,
        borderColor: isActive ? activeRingColor : color,
        minWidth: '140px',
        boxShadow: isActive ? `0 0 20px ${activeRingColor}50` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2">
        <div
          className="p-1.5 rounded-lg flex-shrink-0 relative"
          style={{ backgroundColor: `${color}30`, color }}
        >
          <Box size={20} />
          {isActive && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: activeRingColor }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-800 truncate">
            {data.label}
          </div>
          {/* Sidecar indicator */}
          <div className="flex items-center gap-1 mt-0.5">
            <Network size={10} className="text-cyan-500" />
            <span className="text-[10px] text-cyan-600">+ sidecar proxy</span>
          </div>
          {data.technology && (
            <div className="text-[10px] text-gray-400 truncate">
              {data.technology}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3"
        style={{ backgroundColor: color }}
      />

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

PodNode.displayName = 'PodNode'
