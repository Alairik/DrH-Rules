import { useState } from 'react'
import { GridControls } from './GridControls'
import type { GridConfig } from '@dgvtt/shared'

interface Props {
  grid: GridConfig
  onGridChange: (grid: GridConfig) => void
}

export function Toolbar({ grid, onGridChange }: Props) {
  const [showGridPanel, setShowGridPanel] = useState(false)

  return (
    <div className="fixed top-3 left-3 z-50 flex flex-col gap-2">
      {/* Hlavní toolbar */}
      <div className="flex gap-1 p-1.5 bg-panel-bg border border-panel-border rounded-lg">
        <ToolBtn
          label="⬡"
          title="Grid nastavení"
          active={showGridPanel}
          onClick={() => setShowGridPanel((v) => !v)}
        />
        <ToolBtn label="↖" title="Výběr (V)" onClick={() => {}} />
        <ToolBtn label="✦" title="Token (T)" onClick={() => {}} />
        <div className="w-px bg-panel-border mx-0.5" />
        <ToolBtn label="◉" title="Zdi (W)" onClick={() => {}} />
        <ToolBtn label="☀" title="Světlo (L)" onClick={() => {}} />
      </div>

      {/* Grid panel */}
      {showGridPanel && (
        <GridControls
          grid={grid}
          onTypeChange={(type) => onGridChange({ ...grid, type })}
          onSizeChange={(cellSize) => onGridChange({ ...grid, cellSize })}
          onToggleVisible={() => onGridChange({ ...grid, visible: !grid.visible })}
        />
      )}
    </div>
  )
}

function ToolBtn({
  label,
  title,
  active = false,
  onClick,
}: {
  label: string
  title: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-8 h-8 text-base rounded flex items-center justify-center transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-panel-hover hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}
