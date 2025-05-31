import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Crop } from './types'
import cropsData from '../data/crops.json'

interface CalcState {
  crops: Crop[]
  selectedCropId: string
  volume: number
  unit: 'L' | 'gal'
  strength: number
  setSelectedCropId: (id: string) => void
  setVolume: (volume: number) => void
  setUnit: (unit: 'L' | 'gal') => void
  setStrength: (strength: number) => void
}

export const useCalcStore = create<CalcState>()(
  persist(
    (set) => ({
      crops: (cropsData as unknown) as Crop[],
      selectedCropId: (cropsData as any)[0]?.id || '',
      volume: 1,
      unit: 'L',
      strength: 100,
      setSelectedCropId: (id: string) => set({ selectedCropId: id }),
      setVolume: (volume: number) => set({ volume }),
      setUnit: (unit: 'L' | 'gal') => set({ unit }),
      setStrength: (strength: number) => set({ strength }),
    }),
    {
      name: 'hydro-calc-store',
      partialize: (state: CalcState) => ({
        selectedCropId: state.selectedCropId,
        volume: state.volume,
        unit: state.unit,
        strength: state.strength,
      }),
    }
  )
)
