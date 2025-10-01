// Fracture_Realms_Full_v2/js/boot.js

import { Game } from './game.js';

function start() {
  const canvas = document.getElementById('game');
  const game = new Game(canvas, { mode: 'campaign' });
  window.game = game; // devtools helpers

  // Hotkeys
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'p') game.togglePause();
    if (k === 'u') game.toggleUp();
  });
}

addEventListener('DOMContentLoaded', start);
