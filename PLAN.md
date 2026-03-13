# Dragon Guard VTT — Projektový plán

> **Cílový stav**: Lokální VTT specializované na Dračí hlídku s vlastním soubojovým systémem,
> systémem světel/stínů, osobními deníky, kontrolami pravidel a (ve fázi 3) procedurální generací map.

---

## Stack

| Vrstva | Technologie | Poznámka |
|--------|-------------|----------|
| Canvas / mapa | **PixiJS 8** | WebGL renderer, filtry, render textury |
| Frontend | **React 19 + TypeScript** | Vite jako build tool |
| State | **Zustand** | Real-time přívětivý, jednoduchý |
| Styling | **Tailwind CSS + shadcn/ui** | UI panely, deníky, sheety |
| Rich text | **TipTap** | Editor pro deníky, poznámky |
| Real-time | **Socket.io** | GM ↔ hráči, sync stavu |
| API | **tRPC** | Type-safe volání client ↔ server |
| Backend | **Node.js + Fastify** | Lokální server |
| DB (fáze 1) | **SQLite + Drizzle ORM** | Jeden soubor, nulový setup |
| DB (fáze 2) | **PostgreSQL** | Stejné schema, jen connection string |
| Mapová generace | **rot.js** | BSP, Cellular Automata, WFC |
| Balíčkovač | **pnpm workspaces** | Monorepo |

---

## Struktura projektu

```
dragon-guard-vtt/
├── packages/
│   ├── client/          ← React + PixiJS
│   │   ├── src/
│   │   │   ├── canvas/      ← PIXI scéna, vrstvy
│   │   │   ├── lighting/    ← ray-casting, stíny, LoS
│   │   │   ├── ui/          ← panely, sheety, deníky
│   │   │   ├── store/       ← Zustand store
│   │   │   └── socket/      ← Socket.io client
│   ├── server/          ← Node.js + Fastify
│   │   ├── src/
│   │   │   ├── routes/      ← tRPC routery
│   │   │   ├── db/          ← Drizzle schema + migrace
│   │   │   ├── socket/      ← Socket.io server, eventy
│   │   │   └── mapgen/      ← procedurální generace (fáze 3)
│   └── shared/          ← sdílené typy a herní logika
│       ├── types/           ← Character, Scene, Token...
│       ├── rules/           ← pravidla DrH, hody, kontroly
│       └── combat/          ← CombatSystem interface + DrH implementace
├── data/
│   ├── dragon-guard.db  ← SQLite (fáze 1)
│   └── assets/          ← obrázky map, token sprity, tilesets
└── PLAN.md
```

---

## Datový model (DB schema)

```
Scene          id, name, backgroundImage, gridSize, walls[], lights[]
Token          id, sceneId, characterId, x, y, visible, conditions[]
Character      id, name, race, profession, level, stats{}, inventory[]
JournalEntry   id, characterId, title, content, createdAt, sharedWith[]
RuleCheck      id, characterId, type, roll, modifier, result, context, timestamp
CombatState    id, sceneId, round, turn, initiative[], log[]
Item           id, name, type, weight, lootable, secretUntilInspected
```

---

## Herní systém — modulární architektura

```typescript
// shared/combat/CombatSystem.ts
interface CombatSystem {
  rollInitiative(character: Character): RollResult
  resolveAttack(attacker: Character, defender: Character, action: Action): CombatResult
  applyDamage(target: Character, damage: DamageRoll): Character
  availableActions(character: Character, state: CombatState): Action[]
}

// shared/combat/DragonGuardCombat.ts  ← aktuální implementace
// shared/combat/OtherSystemCombat.ts  ← fáze N, jednoduchý swap
```

---

## Mapa — vrstvy PIXI canvasu

```
[0] BackgroundLayer   ← obrázek mapy / tileset
[1] GridLayer         ← mřížka (toggleovatelná)
[2] ObjectLayer       ← truhly, skříně, tajná místa, dveře
[3] TokenLayer        ← postavy, nepřátelé, NPC
[4] LightingLayer     ← zdroje světla (pochodně, kouzla)
[5] ShadowLayer       ← RenderTexture s LoS maskou (fog of war)
[6] UILayer           ← HP bary, targety, ikonky stavů
```

---

## Lighting systém — implementační přístup

```
Zdi (polygony) ──► Ray-casting ──► Line-of-sight polygon
                                          │
                                   PIXI RenderTexture
                                          │
                              Masky: explored / visible / dark
                                          │
                              Per-hráč fog of war uložený v DB
```

Světelné zdroje mají: `radius`, `color`, `intensity`, `flickering` (animace).
Tajná místa jsou zeď s `{ secret: true }` — viditelné až po hodu Vnímání.

---

## Fáze vývoje

### FÁZE 0 — Základy a monorepo _(start)_

- [ ] Inicializace monorepo (pnpm workspaces, TypeScript, ESLint)
- [ ] Základní Fastify server + tRPC setup
- [ ] SQLite + Drizzle — schema + první migrace
- [ ] React + Vite + Tailwind + shadcn/ui
- [ ] Socket.io — hello world event client ↔ server
- [ ] Importovat stávající data z DrH-Talent-Calculator (JSON → DB seed)

---

### FÁZE 1 — Mapa a canvas _(core)_

- [ ] PIXI canvas — základní scéna, loading obrázku mapy
- [ ] Grid systém — hex / square, snap tokenů na grid
- [ ] Token systém — přidání, pohyb, drag & drop
- [ ] Správa scén — vytvoření, uložení, přepínání
- [ ] Zdi — kreslení polygonů zdí (GM nástroj)
- [ ] Dveře — otevřené / zavřené, animace
- [ ] Export/import scény jako JSON

---

### FÁZE 2 — Lighting a viditelnost _(klíčová feature)_

- [ ] Ray-casting engine — výpočet LoS od tokenu ke zdím
- [ ] Fog of war — per-hráč, explored vs visible
- [ ] Dynamická světla — torch, lantern, spell light
- [ ] Světelné parametry — radius, barva, intenzita
- [ ] Flickering animace světel
- [ ] Tajná místa — `secret: true`, reveal po hodu
- [ ] Ambientní osvětlení scény (nastavitelné GM)

---

### FÁZE 3 — Character sheet a pravidla DrH _(game system)_

- [ ] Character sheet UI — stats, atributy, HP, mana
- [ ] Importovat povolání, talenty, dovednosti z DrH-Talent-Calculator
- [ ] Hody kostek — inline v UI, s modifikátory
- [ ] Kontroly pravidel — automatické výpočty (útok, obrana, save)
- [ ] RuleCheck log — history hodů s kontextem
- [ ] Inventář — váha, vybavené předměty, sloty
- [ ] Podmínky / stavy — Paralyzovaný, Otrávený, Oslepen...

---

### FÁZE 4 — Soubojový systém _(DrH implementace)_

- [ ] CombatSystem interface — modulární základ
- [ ] DragonGuard implementace — iniciativa, kola, akce
- [ ] Combat tracker UI — pořadí, HP bary, kolo
- [ ] Akce v boji — útok, obrana, kouzlo, pohyb
- [ ] AoE — oblasti účinku vizualizované na mapě
- [ ] Targeting — kliknutí na token = cíl útoku
- [ ] Combat log — přehledný log kola s výsledky

---

### FÁZE 5 — Deníky a poznámky _(journaling)_

- [ ] TipTap editor — rich text, nadpisy, odrážky
- [ ] Osobní deníky — per-hráč, viditelné jen jim
- [ ] GM deník — sdílené poznámky, secrets
- [ ] Sdílení záznamu — GM může odhalit zápis hráčům
- [ ] Inline hod — `[[2d6+3]]` syntax v textu deníku
- [ ] Propojení na entitu — deník navázaný na postavu / scénu / NPC

---

### FÁZE 6 — Multi-player a sync _(real-time)_

- [ ] GM / hráč role — různá oprávnění
- [ ] Real-time pohyb tokenů — Socket.io broadcast
- [ ] Fog of war sync — per-hráč viditelnost
- [ ] Dice roll broadcast — výsledek hodů vidí všichni
- [ ] Chat — základní herní chat s výsledky hodů
- [ ] Ukazatel kurzoru GM — sdílený pointer na mapě

---

### FÁZE 7 — Procedurální generace map _(bonus)_

- [ ] rot.js integrace — BSP dungeon generátor
- [ ] Cellular Automata — generace jeskyní
- [ ] Wave Function Collapse — tile-coherentní mapy
- [ ] Tileset systém — Kenney.nl dungeon tiles nebo vlastní
- [ ] Placement engine — truhly, skříně, pasti, tajná místa
- [ ] Placement pravidla — dead-ends → truhly, rohy → skříně
- [ ] Loot tabulky — obsah truhel navázaný na level / typ dungeonu
- [ ] Export generované mapy → normální editovatelná scéna

---

### FÁZE 8 — Server deployment _(phase 2)_

- [ ] Docker + docker-compose setup
- [ ] Migrace SQLite → PostgreSQL (Drizzle, jen connection string)
- [ ] Nginx reverse proxy + WSS
- [ ] Autentizace — session tokeny, hráčské účty
- [ ] Asset hosting — statické soubory nebo S3-compatible
- [ ] Zálohování DB

---

## Datový tok — příklad: útok v boji

```
Hráč klikne "Útok" na token nepřítele
        │
        ▼
Client (React) → tRPC mutation: combat.attack({ attackerId, targetId, actionId })
        │
        ▼
Server (Fastify) → shared/combat/DragonGuardCombat.resolveAttack()
        │
        ▼
Výsledek uložen do DB (RuleCheck log + CombatState)
        │
        ▼
Socket.io broadcast → všichni klienti dostanou výsledek
        │
        ▼
Canvas update (HP bar), Combat log update, Chat zpráva
```

---

## Pravidla vývoje

1. **Nejdřív typy** — každá nová feature začíná definicí typů v `shared/types/`
2. **Nejdřív server** — DB schema → tRPC endpoint → client UI
3. **Modulární combat** — nikdy hardcode DrH logiku mimo `shared/combat/DragonGuardCombat.ts`
4. **Fáze jsou iterace** — každá fáze je hratelná / testovatelná sama o sobě
5. **Lokální první** — žádná cloud závislost do fáze 8

---

## Zdroje a reference

- Stávající data: `/DrH-Talent-Calculator/research/*.json`
- Pravidla: `/DrH-Rules/Readme`
- PixiJS docs: https://pixijs.com/
- rot.js: https://ondras.github.io/rot.js/
- Drizzle ORM: https://orm.drizzle.team/
- Kenney assets: https://kenney.nl/assets/category:Roguelike
- Foundry VTT lighting reference: https://foundryvtt.com/article/lighting/
