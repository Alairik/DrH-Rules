# Přesun VTT kódu do DrH-VTT repozitáře

## Co je potřeba udělat

Celý VTT projekt (Dragon Guard VTT) je aktuálně uložen v repozitáři **DrH-Rules**
na větvi `claude/dragon-guard-vtt-jn90g`. Potřebujeme ho přesunout do vlastního
repozitáře **Alairik/DrH-VTT**.

## Úkol pro novou session

1. Zkopíruj obsah větve `claude/dragon-guard-vtt-jn90g` z **Alairik/DrH-Rules**
   do **Alairik/DrH-VTT** jako větev `main`.

2. Konkrétně: pushni všechny commity a soubory z `DrH-Rules:claude/dragon-guard-vtt-jn90g`
   do `DrH-VTT:main`.

## Co VTT repozitář obsahuje

```
packages/
├── client/    ← React + PixiJS (frontend, mapa, hex/square grid)
├── server/    ← Node.js + Fastify + tRPC + SQLite
└── shared/    ← sdílené TypeScript typy
start.bat      ← Windows dvojklik spuštění
start.ps1      ← PowerShell startup skript
setup.ps1      ← Prvotní instalace (spustit jednou)
PLAN.md        ← Projektový plán
```

## Git příkazy pro provedení

```bash
# Naklonuj DrH-Rules VTT větev
git clone --branch claude/dragon-guard-vtt-jn90g https://github.com/Alairik/DrH-Rules /tmp/vtt-migration
cd /tmp/vtt-migration

# Přepoj remote na DrH-VTT
git remote remove origin
git remote add origin https://github.com/Alairik/DrH-VTT

# Push jako main
git push -u origin claude/dragon-guard-vtt-jn90g:main
```

## Po přesunu

- **DrH-Rules** zůstane pro pravidla Dračí hlídky (tento repozitář)
- **DrH-Talent-Calculator** zůstane kalkulátor talentů
- **DrH-VTT** bude samostatný VTT projekt

Větev `claude/dragon-guard-vtt-jn90g` v DrH-Rules lze po úspěšném přesunu smazat.
