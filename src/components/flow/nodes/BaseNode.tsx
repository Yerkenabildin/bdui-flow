import { memo, ReactNode, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { NodeData } from '../../../types'
import { useAnimationStore, NodeStats } from '../../../stores/animationStore'
import { Activity, Clock, Zap } from 'lucide-react'

interface BaseNodeProps {
  id: string
  data: NodeData
  icon: ReactNode
  color: string
  onClick?: () => void
}

// Цвет по латентности
const getLatencyColor = (latency: number): string => {
  if (latency <= 50) return '#22c55e'   // зелёный
  if (latency <= 200) return '#eab308'  // жёлтый
  if (latency <= 500) return '#f97316'  // оранжевый
  return '#ef4444'                       // красный
}

export const BaseNode = memo(({ id, data, icon, color, onClick }: BaseNodeProps) => {
  const activeNodeIds = useAnimationStore((s) => s.activeNodeIds)
  const nodeStats = useAnimationStore((s) => s.nodeStats)
  const currentStepType = useAnimationStore((s) => s.currentStepType)
  const isActive = activeNodeIds.includes(id)
  const stats: NodeStats | undefined = nodeStats[id]

  const [showTooltip, setShowTooltip] = useState(false)

  // Извлекаем паттерн из description (до тире)
  const pattern = data.description?.split('—')[0]?.trim() || ''

  // Цвет кольца активности по типу шага
  const activeRingColor = currentStepType === 'request' ? '#3b82f6'
    : currentStepType === 'response' ? '#22c55e'
    : currentStepType === 'async' ? '#f97316'
    : '#fbbf24'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`
        relative px-3 py-2 rounded-lg border-2 shadow-lg
        transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-xl
      `}
      style={{
        backgroundColor: `${color}15`,
        borderColor: isActive ? activeRingColor : color,
        minWidth: '160px',
        maxWidth: '220px',
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
          {icon}
          {/* Processing indicator */}
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
          {pattern && (
            <div
              className="text-[10px] font-medium truncate"
              style={{ color }}
            >
              {pattern}
            </div>
          )}
          {data.technology && (
            <div className="text-[10px] text-gray-400 truncate">
              {data.technology}
            </div>
          )}
        </div>
      </div>

      {/* Stats badges - показываем если есть статистика */}
      {stats && stats.requestCount > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
          {/* Request count */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-[10px]">
            <Activity size={10} className="text-gray-500" />
            <span className="text-gray-600 font-medium">{stats.requestCount}</span>
          </div>

          {/* Last latency */}
          {stats.lastLatency !== null && (
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: `${getLatencyColor(stats.lastLatency)}20`,
                color: getLatencyColor(stats.lastLatency),
              }}
            >
              <Clock size={10} />
              <span className="font-medium">{stats.lastLatency}ms</span>
            </div>
          )}

          {/* Avg latency */}
          {stats.requestCount > 1 && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-[10px] text-blue-600">
              <Zap size={10} />
              <span className="font-medium">
                ~{Math.round(stats.totalLatency / stats.requestCount)}ms
              </span>
            </div>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3"
        style={{ backgroundColor: color }}
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

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50
                     bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl
                     min-w-[200px] max-w-[280px]"
          style={{ pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-1">{data.label}</div>
          {data.description && (
            <div className="text-gray-300 text-[11px] mb-2">{data.description}</div>
          )}
          {data.technology && (
            <div className="text-gray-400 text-[10px]">
              Tech: {data.technology}
            </div>
          )}
          {stats && stats.requestCount > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700 text-[10px]">
              <div className="text-gray-300">Requests: {stats.requestCount}</div>
              <div className="text-gray-300">
                Avg latency: {Math.round(stats.totalLatency / stats.requestCount)}ms
              </div>
            </div>
          )}
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                          border-l-[6px] border-r-[6px] border-t-[6px]
                          border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
})

BaseNode.displayName = 'BaseNode'
