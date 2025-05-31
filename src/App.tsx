import { useState } from 'react'
import { useCalcStore } from './store'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const {
    crops,
    selectedCropId,
    volume,
    unit,
    strength,
    setSelectedCropId,
    setVolume,
    setUnit,
    setStrength,
  } = useCalcStore()

  const selectedCrop = crops.find((c) => c.id === selectedCropId)
  const volumeInL = unit === 'gal'
    ? volume * 3.785
    : unit === 'ml'
    ? volume / 1000
    : volume
  const scale = strength / 100
  const grams = selectedCrop
    ? {
        mb: selectedCrop.gramsPerLiter.mb * volumeInL * scale,
        can: selectedCrop.gramsPerLiter.can * volumeInL * scale,
        mgso4: selectedCrop.gramsPerLiter.mgso4 * volumeInL * scale,
      }
    : { mb: 0, can: 0, mgso4: 0 }
  const tsps = {
    mb: +(grams.mb / 4.93).toFixed(1),
    can: +(grams.can / 4.93).toFixed(1),
    mgso4: +(grams.mgso4 / 4.93).toFixed(1),
  }
  const warnEC =
    selectedCrop && (strength / 100) * ((selectedCrop.ecRange[0] + selectedCrop.ecRange[1]) / 2) > selectedCrop.ecRange[1]

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Crop selector, volume input, strength slider */}
      <input
        type="text"
        placeholder="Search crops..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-2"
      />
      <select
        value={selectedCropId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCropId(e.target.value)}
        className="w-full p-2 mb-4"
      >
        {crops
          .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((c: { id: string; name: string; ecRange: [number, number] }) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.ecRange[0]}–{c.ecRange[1]} mS/cm)
            </option>
          ))}
      </select>
      <div className="flex space-x-2 mb-4">
        <input
          type="number"
          value={volume}
          min={0}
          max={10000}
          onChange={(e) => setVolume(+e.target.value)}
          className="flex-grow p-2"
        />
        <select
          value={unit}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUnit(e.target.value as 'ml' | 'L' | 'gal')}
          className="p-2"
        >
          <option value="ml">ml</option>
          <option value="L">L</option>
          <option value="gal">gal</option>
        </select>
      </div>
      <div className="mb-4">
        <label>Strength: {strength}%</label>
        <input
          type="range"
          min={50}
          max={150}
          value={strength}
          onChange={(e) => setStrength(+e.target.value)}
          className="w-full"
        />
      </div>
      {warnEC && <p className="text-red-500 mb-4">Warning: EC outside target range</p>}
      {/* Results */}
      <div className="space-y-2">
        {(['mb', 'can', 'mgso4'] as const).map((key: 'mb' | 'can' | 'mgso4') => (
          <div key={key} className="flex justify-between items-center">
            <span className="capitalize">{key}</span>
            <span>{(grams[key] as number).toFixed(2)} g / {(tsps[key] as number)} tsp</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
