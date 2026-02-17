import { memo, ReactNode, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { BduiNodeData } from '../../../types'

interface BaseNodeProps {
  id: string
  data: BduiNodeData
  icon: ReactNode
  color: string
}

export const BaseNode = memo(({ data, icon, color }: BaseNodeProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative px-3 py-2 rounded-lg border-2 shadow-md transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl"
      style={{
        backgroundColor: `${color}12`,
        borderColor: color,
        minWidth: '150px',
        maxWidth: '200px',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2">
        <div
          className="p-1.5 rounded-md flex-shrink-0"
          style={{ backgroundColor: `${color}25`, color }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-800 truncate">
            {data.label}
          </div>
          {data.technology && (
            <div
              className="text-[10px] font-medium truncate"
              style={{ color }}
            >
              {data.technology}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5"
        style={{ backgroundColor: color }}
      />

      {/* Bottom handle for vertical connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2.5 !h-2.5"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2.5 !h-2.5"
        style={{ backgroundColor: color }}
      />

      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50
                     bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl
                     min-w-[200px] max-w-[280px]"
          style={{ pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-1">{data.label}</div>
          {data.description && (
            <div className="text-gray-300 text-[11px] leading-relaxed">{data.description}</div>
          )}
          {data.technology && (
            <div className="text-gray-400 text-[10px] mt-1">
              Tech: {data.technology}
            </div>
          )}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                          border-l-[6px] border-r-[6px] border-t-[6px]
                          border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
})

BaseNode.displayName = 'BaseNode'
