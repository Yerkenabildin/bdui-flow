import { X, Cpu, CheckCircle2, ExternalLink } from 'lucide-react'
import { useNodeInfoStore } from '../../stores/nodeInfoStore'
import { nodeDescriptions } from '../../data/nodeDescriptions'
import { BduiNodeType } from '../../types'

export default function NodeInfoPanel() {
  const { selectedNode, clearSelection } = useNodeInfoStore()

  if (!selectedNode) {
    return (
      <div className="text-sm text-gray-400 text-center py-8">
        Нажмите на компонент для просмотра деталей
      </div>
    )
  }

  const nodeType = selectedNode.type as BduiNodeType
  const description = nodeDescriptions[nodeType]

  if (!description) return null

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Cpu size={18} />
          {selectedNode.data.label}
        </h3>
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-lg text-gray-800">{description.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description.purpose}</p>
        {selectedNode.data.technology && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {selectedNode.data.technology}
          </span>
        )}
      </div>

      <div className="mb-4 p-3 rounded-lg border bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Ключевые функции</span>
        </div>
        <ul className="text-sm text-gray-600 space-y-1 pl-5">
          {description.keyFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {selectedNode.data.links && selectedNode.data.links.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-700">Мониторинг</span>
          </div>
          <ul className="space-y-1.5 pl-5">
            {selectedNode.data.links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-900 hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <span className="text-xs text-gray-500 font-medium">Технологии:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {description.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
