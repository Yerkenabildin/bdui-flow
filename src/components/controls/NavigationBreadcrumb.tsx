import { ChevronRight, Home } from 'lucide-react'
import { useNavigationStore } from '../../stores/navigationStore'
import { ViewLevel } from '../../types'

interface Breadcrumb {
  label: string
  level: ViewLevel
}

export default function NavigationBreadcrumb() {
  const { viewLevel, focusedDcId, goBack, reset } = useNavigationStore()

  const getBreadcrumbs = (): Breadcrumb[] => {
    const crumbs: Breadcrumb[] = [{ label: 'Global', level: 'global' }]

    if (viewLevel === 'datacenter' || viewLevel === 'cluster') {
      crumbs.push({ label: focusedDcId || 'Data Center', level: 'datacenter' })
    }

    if (viewLevel === 'cluster') {
      crumbs.push({ label: 'K8s Cluster', level: 'cluster' })
    }

    return crumbs
  }

  const crumbs = getBreadcrumbs()

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2 border border-gray-200">
      <button
        onClick={reset}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Go to Global View"
      >
        <Home size={18} className="text-gray-600" />
      </button>

      {crumbs.map((crumb, index) => (
        <div key={crumb.level} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
          <button
            onClick={() => {
              if (crumb.level === 'global') reset()
              else if (crumb.level === 'datacenter' && viewLevel === 'cluster') goBack()
            }}
            className={`px-2 py-1 rounded text-sm transition-colors ${
              index === crumbs.length - 1
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {crumb.label}
          </button>
        </div>
      ))}

      {viewLevel !== 'global' && (
        <button
          onClick={goBack}
          className="ml-auto text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  )
}
