# ⚔️ Fracture Realms — Full Build (v2)

A complete, offline, browser-playable action game with **many worlds**, animated realms, adaptive enemies, skill-test bosses, a **world map (campaign)**, **endless mode**, upgrades, autosave, assist options, and **gamepad support**.

## How to Run
- Download the ZIP and extract.
- Open `index.html` in Chrome/Edge/Firefox/Safari (desktop recommended).

## Modes
- **Campaign** — clear worlds on the map; each has a realm theme, boss, and modifiers.
- **Endless** — survive waves with escalating hazards.

## Controls
**Keyboard P1**: A/D move • W jump (double) • J melee • K magic • L dash • E grapple • U upgrades • P pause • 1..3 style switch (after unlock)  
**Gamepad**: LS move • A jump • X melee • Y magic • B dash • RB grapple • Start pause

## Features
- 8 **worlds** with distinct backdrops & modifiers (gravity flip cadence, time pulses).
- 4 **bosses**: Airborne Titan, Mirror Swarm (clones), Gravity Serpent (gravity tricks), Chrono Warden (time waves).
- Enemies: grunt/brute variants; adaptive blocking.
- Upgrades: triple/ultra dash, magic ricochet, aerial combo boost, grapple boost, style switch.
- Procedural SFX with WebAudio (no assets needed).
- Assist mode (safer platforms), particles & screen shake toggles.
- Autosave: shards/unlocks persist in `localStorage`.

## Extend
- Add spritesheets in `/assets` and a draw routine.
- Hook up Node + Socket.IO for online co-op.
- Export as desktop app via Electron.
