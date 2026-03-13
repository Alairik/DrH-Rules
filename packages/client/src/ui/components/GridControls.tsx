import type { GridConfig } from '@dgvtt/shared'

interface Props {
  grid: GridConfig
  onTypeChange: (type: GridConfig['type']) => void
  onSizeChange: (size: number) => void
  onToggleVisible: () => void
}

export function GridControls({ grid, onTypeChange, onSizeChange, onToggleVisible }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-panel-bg border border-panel-border rounded-lg w-52">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Grid</span>

      {/* Typ gridu */}
      <div className="flex gap-1">
        <button
          onClick={() => onTypeChange('hex')}
          className={`flex-1 py-1.5 text-sm rounded transition-colors ${
            grid.type === 'hex'
              ? 'bg-indigo-600 text-white'
              : 'bg-panel-hover text-gray-300 hover:bg-indigo-700/50'
          }`}
        >
          Hex
        </button>
        <button
          onClick={() => onTypeChange('square')}
          className={`flex-1 py-1.5 text-sm rounded transition-colors ${
            grid.type === 'square'
              ? 'bg-indigo-600 text-white'
              : 'bg-panel-hover text-gray-300 hover:bg-indigo-700/50'
          }`}
        >
          Čtverec
        </button>
      </div>

      {/* Velikost buňky */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Velikost</span>
          <span className="text-xs text-gray-300 font-mono">{grid.cellSize}px</span>
        </div>
        <input
          type="range"
          min={25}
          max={120}
          step={5}
          value={grid.cellSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Viditelnost */}
      <button
        onClick={onToggleVisible}
        className={`py-1.5 text-sm rounded border transition-colors ${
          grid.visible
            ? 'border-panel-border text-gray-300 hover:bg-panel-hover'
            : 'border-indigo-500/50 text-indigo-400 bg-indigo-900/20'
        }`}
      >
        {grid.visible ? 'Skrýt grid' : 'Zobrazit grid'}
      </button>
    </div>
  )
}
