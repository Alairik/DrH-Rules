# Dragon Guard VTT — Startup skript (PowerShell)
# Spustit: .\start.ps1
# Nebo z průzkumníka: pravý klik → "Spustit s PowerShell"

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

function Write-Step($msg) {
    Write-Host ""
    Write-Host "  ► $msg" -ForegroundColor Cyan
}

function Write-Ok($msg) {
    Write-Host "  ✓ $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "  ✗ $msg" -ForegroundColor Red
}

Clear-Host
Write-Host ""
Write-Host "  ╔══════════════════════════════════╗" -ForegroundColor DarkCyan
Write-Host "  ║     Dragon Guard VTT             ║" -ForegroundColor DarkCyan
Write-Host "  ╚══════════════════════════════════╝" -ForegroundColor DarkCyan
Write-Host ""

Set-Location $Root

# ── Kontrola Node.js ──────────────────────────────────────────────────────────
Write-Step "Kontrola Node.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js nenalezen."
    Write-Host "  Stáhni z https://nodejs.org (LTS verze)" -ForegroundColor Yellow
    Read-Host "Stiskni Enter pro ukončení"
    exit 1
}
$nodeVer = node --version
Write-Ok "Node.js $nodeVer"

# ── Kontrola pnpm ─────────────────────────────────────────────────────────────
Write-Step "Kontrola pnpm"
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "  pnpm není nainstalován. Instaluji..." -ForegroundColor Yellow
    npm install -g pnpm | Out-Null
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Fail "Instalace pnpm selhala. Zkus: npm install -g pnpm"
        Read-Host "Stiskni Enter pro ukončení"
        exit 1
    }
}
$pnpmVer = pnpm --version
Write-Ok "pnpm $pnpmVer"

# ── Instalace závislostí ──────────────────────────────────────────────────────
Write-Step "Závislosti"
$lockFile = Join-Path $Root "pnpm-lock.yaml"
$modules  = Join-Path $Root "node_modules"

if (-not (Test-Path $modules)) {
    Write-Host "  Instaluji závislosti (první spuštění, chvíli trvá)..." -ForegroundColor Yellow
    pnpm install
    Write-Ok "Závislosti nainstalovány"
} else {
    Write-Ok "Závislosti OK (node_modules existuje)"
}

# ── Build shared ──────────────────────────────────────────────────────────────
Write-Step "Build sdílených typů"
pnpm --filter @dgvtt/shared build | Out-Null
Write-Ok "Shared package zkompilován"

# ── Vytvoř data složku ────────────────────────────────────────────────────────
$dataDir = Join-Path $Root "data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

# ── Spuštění ──────────────────────────────────────────────────────────────────
Write-Step "Spouštím server a klienta"
Write-Host ""
Write-Host "  Server:  http://localhost:3001" -ForegroundColor White
Write-Host "  Klient:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Pro ukončení stiskni Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

# Spustí server a klienta v oddělených oknech
$serverCmd = "Set-Location '$Root'; pnpm --filter @dgvtt/server dev"
$clientCmd = "Set-Location '$Root'; pnpm --filter @dgvtt/client dev"

$serverJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverCmd -PassThru
$clientJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", $clientCmd -PassThru

# Počkej pár sekund a otevři prohlížeč
Start-Sleep 4
Start-Process "http://localhost:5173"

Write-Host "  Otevřen prohlížeč. Zavři tato okna pro ukončení." -ForegroundColor DarkGray

# Drž hlavní okno otevřené
Wait-Process -Id $serverJob.Id -ErrorAction SilentlyContinue
