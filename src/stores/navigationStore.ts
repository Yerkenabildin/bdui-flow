import { create } from 'zustand'
import { ViewLevel } from '../types'

interface NavigationStore {
  viewLevel: ViewLevel
  focusedDcId: string | null
  focusedClusterId: string | null

  setViewLevel: (level: ViewLevel) => void
  focusDatacenter: (dcId: string) => void
  focusCluster: (clusterId: string) => void
  goBack: () => void
  reset: () => void
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  viewLevel: 'global',
  focusedDcId: null,
  focusedClusterId: null,

  setViewLevel: (level) => set({ viewLevel: level }),

  focusDatacenter: (dcId) => set({
    viewLevel: 'datacenter',
    focusedDcId: dcId,
    focusedClusterId: null
  }),

  focusCluster: (clusterId) => set({
    viewLevel: 'cluster',
    focusedClusterId: clusterId
  }),

  goBack: () => {
    const { viewLevel } = get()
    if (viewLevel === 'cluster') {
      set({ viewLevel: 'datacenter', focusedClusterId: null })
    } else if (viewLevel === 'datacenter') {
      set({ viewLevel: 'global', focusedDcId: null })
    }
  },

  reset: () => set({
    viewLevel: 'global',
    focusedDcId: null,
    focusedClusterId: null,
  }),
}))
