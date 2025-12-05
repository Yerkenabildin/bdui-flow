import { useScenarioStore } from '../../stores/scenarioStore'
import { useAnimationStore } from '../../stores/animationStore'
import { useNavigationStore } from '../../stores/navigationStore'

export default function ScenarioSelector() {
  const { scenarios, currentScenarioId, setScenario, getCurrentScenario } = useScenarioStore()
  const { reset: resetAnimation } = useAnimationStore()
  const { setViewLevel, focusDatacenter, reset: resetNavigation } = useNavigationStore()

  const currentScenario = getCurrentScenario()

  const handleScenarioChange = (scenarioId: string) => {
    resetAnimation()
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (scenario) {
      setScenario(scenarioId)
      // Set initial view level for the scenario
      if (scenario.initialViewLevel === 'cluster') {
        focusDatacenter('dc-europe')
        setViewLevel('cluster')
      } else {
        resetNavigation()
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Scenario</h3>

      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleScenarioChange(scenario.id)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              currentScenarioId === scenario.id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="font-medium text-gray-800 text-sm">
              {scenario.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {scenario.steps.length} steps
            </div>
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            {currentScenario.description}
          </div>
        </div>
      )}
    </div>
  )
}
