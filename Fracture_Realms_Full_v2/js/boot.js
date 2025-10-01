// Fracture_Realms_Full_v2/js/boot.js  — minimal, correct entry point

import { Game } from './game.js';

function start() {
  const canvas = document.getElementById('game');
  const game = new Game(canvas, { mode: 'campaign' });

  // expose for quick debugging in devtools
  window.game = game;

  // Optional: if your HTML has explicit "Open/Close Upgrades" buttons,
  // wire them here. (Safe no-ops if the elements don't exist.)
  const openUp =
    document.getElementById('btnOpenUpgrades') ||
    document.querySelector('[data-action="open-upgrades"]');
  const closeUp =
    document.getElementById('btnCloseUpgrades') ||
    document.querySelector('[data-action="close-upgrades"]');

  if (openUp)  openUp.addEventListener('click', () => game.toggleUp(true));
  if (closeUp) closeUp.addEventListener('click', () => game.toggleUp(false));

  // Convenience hotkeys
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'p') game.togglePause(); // pause/resume
    if (k === 'u') game.toggleUp();    // open/close upgrades
  });
}

window.addEventListener('DOMContentLoaded', start);
