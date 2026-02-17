import FlowCanvas from '../flow/FlowCanvas'
import NodeInfoPanel from '../panels/NodeInfoPanel'
import {
  Smartphone, Network, GitBranch, Shield, Boxes, Server, Layers,
} from 'lucide-react'

const legendItems = [
  { label: 'Client', color: '#3B82F6', Icon: Smartphone },
  { label: 'L3 Balancer', color: '#A855F7', Icon: Network },
  { label: 'L7 Balancer', color: '#10B981', Icon: GitBranch },
  { label: 'API Gateway', color: '#06B6D4', Icon: Shield },
  { label: 'Proxy', color: '#F97316', Icon: Boxes },
  { label: 'Service', color: '#6366F1', Icon: Server },
  { label: 'Renderer', color: '#F43F5E', Icon: Layers },
]

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              BDUI Request Flow
            </h1>
            <p className="text-sm text-gray-500">
              Путь запроса от мобильного приложения через балансировщики, proxy и сервисы до рендерера
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            {legendItems.map(({ label, color, Icon }) => (
              <span key={label} className="flex items-center gap-1">
                <Icon size={12} style={{ color }} />
                <span className="text-gray-600">{label}</span>
              </span>
            ))}
            <span className="border-l pl-3 ml-1 flex items-center gap-2 text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-5 h-0 border-t-2 border-gray-500 inline-block" />
                request
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-0 border-t-2 border-dashed border-gray-400 inline-block" />
                response
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-0 border-t-2 border-orange-500 inline-block" />
                after wait
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <main className="flex-1">
          <FlowCanvas />
        </main>

        {/* Right sidebar - info */}
        <aside className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <NodeInfoPanel />
        </aside>
      </div>
    </div>
  )
}
