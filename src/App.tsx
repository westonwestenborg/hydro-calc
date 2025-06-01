import { useState } from 'react'
import { useCalcStore } from './store'
import './styles.css'

// Define nutrient names and descriptions for better UX
const NUTRIENTS = {
  mb: {
    name: 'MasterBlend',
    fullName: 'MasterBlend 4-18-38',
    description: 'Complete hydroponic fertilizer with micronutrients'
  },
  can: {
    name: 'Calcium Nitrate',
    fullName: 'Calcium Nitrate 15.5-0-0',
    description: 'Provides calcium and nitrogen'
  },
  mgso4: {
    name: 'Epsom Salt',
    fullName: 'Magnesium Sulfate (MgSO₄)',
    description: 'Provides magnesium and sulfur'
  }
}

// Define category colors and icons
const CATEGORIES = {
  leafy: {
    name: 'Leafy Greens',
    color: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
    icon: '🥬'
  },
  herb: {
    name: 'Herbs',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    icon: '🌿'
  },
  fruiting: {
    name: 'Fruiting Plants',
    color: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
    icon: '🍅'
  }
}

// Define specific crop emojis
const CROP_EMOJIS: Record<string, string> = {
  lettuce: '🥬',
  spinach: '🍃',
  kale: '🥗',
  basil: '🌿',
  mint: '🌱',
  tomato: '🍅',
  pepper: '🌶️',
  cucumber: '🥒'
}

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
  
  // Calculate EC value
  const currentEC = selectedCrop 
    ? (strength / 100) * ((selectedCrop.ecRange[0] + selectedCrop.ecRange[1]) / 2)
    : 0
  
  // Determine if EC is outside range
  const warnEC = selectedCrop && currentEC > selectedCrop.ecRange[1]

  return (
    <div className="w-full max-w-md py-8 px-4 sm:px-6">
      <div className="w-full">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">HydroCalc</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Hydroponics Nutrient Calculator</p>
        </header>

        {/* Main Card */}
        <div className="card mb-6">
          {/* Crop search */}
          <div className="input-group mb-0">
            <label htmlFor="crop-search" className="input-label">Select Crop</label>
            <div className="relative">
              <input
                id="crop-search"
                type="text"
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Crop selector dropdown - separate from search */}
          <div className="input-group" style={{ marginTop: '1rem' }}>
            <div className="select-wrapper">
              <select
                value={selectedCropId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCropId(e.target.value)}
                className="w-full"
              >
              {crops
                .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {CROP_EMOJIS[c.id] || CATEGORIES[c.category].icon} {c.name} ({c.ecRange[0]}–{c.ecRange[1]} mS/cm)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* No crop info display here anymore */}

          {/* Volume input */}
          <div className="input-group">
            <label htmlFor="volume-input" className="input-label">Water Volume</label>
            <div className="flex space-x-2">
              <input
                id="volume-input"
                type="number"
                value={volume}
                min={0}
                max={10000}
                onChange={(e) => setVolume(+e.target.value)}
                className="flex-grow"
              />
              <div className="select-wrapper">
                <select
                  value={unit}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUnit(e.target.value as 'ml' | 'L' | 'gal')}
                  className="w-24"
                >
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="gal">gal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Strength slider */}
          <div className="input-group">
            <div className="flex justify-between">
              <label htmlFor="strength-slider" className="input-label">Nutrient Strength</label>
              <span className="font-medium text-primary-600 dark:text-primary-400">{strength}%</span>
            </div>
            <input
              id="strength-slider"
              type="range"
              min={50}
              max={150}
              value={strength}
              onChange={(e) => setStrength(+e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>50%</span>
              <span>100%</span>
              <span>150%</span>
            </div>
          </div>

          {/* EC warning */}
          {warnEC && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">High EC Warning</p>
                <p>Current EC ({currentEC.toFixed(1)} mS/cm) exceeds the recommended range for {selectedCrop?.name}.</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-primary-600 dark:text-primary-400">Nutrient Formula</h2>
          
          <div className="space-y-4">
            {Object.entries(NUTRIENTS).map(([key, nutrient]) => {
              const nutrientKey = key as keyof typeof grams;
              const gramValue = grams[nutrientKey];
              const tspValue = tsps[nutrientKey];
              
              return (
                <div key={key} className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{nutrient.name}</span>
                    <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {gramValue.toFixed(2)} g
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <span>{nutrient.fullName}</span>
                    <span>≈ {tspValue} tsp</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <p>Mix nutrients one at a time in the order shown above.</p>
            <p>Allow each to fully dissolve before adding the next.</p>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>HydroCalc © {new Date().getFullYear()} • Hydroponic Nutrient Calculator</p>
        </footer>
      </div>
    </div>
  )
}

export default App
