import { create } from 'zustand'
import { Scenario, Step } from '../types'
import { scenarios } from '../data/scenarios'

interface ScenarioStore {
  scenarios: Scenario[]
  currentScenarioId: string | null

  getCurrentScenario: () => Scenario | null
  getCurrentStep: (stepIndex: number) => Step | null
  getTotalSteps: () => number
  setScenario: (scenarioId: string) => void
  reset: () => void
}

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  scenarios: scenarios,
  currentScenarioId: scenarios[0]?.id || null,

  getCurrentScenario: () => {
    const { scenarios, currentScenarioId } = get()
    return scenarios.find(s => s.id === currentScenarioId) || null
  },

  getCurrentStep: (stepIndex: number) => {
    const scenario = get().getCurrentScenario()
    if (!scenario || stepIndex < 0 || stepIndex >= scenario.steps.length) {
      return null
    }
    return scenario.steps[stepIndex]
  },

  getTotalSteps: () => {
    const scenario = get().getCurrentScenario()
    return scenario?.steps.length || 0
  },

  setScenario: (scenarioId) => set({ currentScenarioId: scenarioId }),

  reset: () => set({ currentScenarioId: scenarios[0]?.id || null }),
}))
