# Dragon Guard VTT — Prvotní setup (spusť jednou)
# Řeší Windows build tools pro nativní moduly (better-sqlite3)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Clear-Host
Write-Host ""
Write-Host "  Dragon Guard VTT — Setup" -ForegroundColor Cyan
Write-Host ""

Set-Location $Root

# Kontrola Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Node.js nenalezen. Stáhni LTS z https://nodejs.org" -ForegroundColor Red
    Read-Host "Enter pro ukončení"
    exit 1
}
Write-Host "  ✓ Node.js $(node --version)" -ForegroundColor Green

# Instalace pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "  Instaluji pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "  ✓ pnpm $(pnpm --version)" -ForegroundColor Green

# Instalace windows-build-tools (pro better-sqlite3)
Write-Host ""
Write-Host "  Instaluji závislosti projektu..." -ForegroundColor Yellow
pnpm install

# Build native modulu
Write-Host ""
Write-Host "  Kompiluji better-sqlite3 (native SQLite)..." -ForegroundColor Yellow
Set-Location (Join-Path $Root "node_modules\.pnpm\better-sqlite3@11.10.0\node_modules\better-sqlite3")
npx --yes node-gyp rebuild
Set-Location $Root

# Build shared
Write-Host ""
Write-Host "  Build shared typů..." -ForegroundColor Yellow
pnpm --filter @dgvtt/shared build

Write-Host ""
Write-Host "  ╔══════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Setup dokončen!                ║" -ForegroundColor Green
Write-Host "  ║   Spusť start.bat pro hru        ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Read-Host "Enter pro ukončení"
