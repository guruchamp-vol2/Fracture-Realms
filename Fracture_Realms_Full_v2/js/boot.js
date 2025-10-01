// Fracture_Realms_Full_v2/js/boot.js  — FULL FILE (patched)

import { Game } from './game.js';

function start() {
  const canvas = document.getElementById('game');
  const game = new Game(canvas, { mode: 'campaign' });

  // Expose for quick devtools access
  window.game = game;

  // Handy hotkeys
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'p') game.togglePause(); // pause/resume
    if (k === 'u') game.toggleUp();    // open/close upgrades
  });
}

window.addEventListener('DOMContentLoaded', start);
