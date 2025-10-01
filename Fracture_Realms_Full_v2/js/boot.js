// Fracture_Realms_Full_v2/js/boot.js — FULL FILE REPLACE

import { Game } from './game.js';
import { Campaign } from './campaign.js';
import { SceneManager } from './scene_manager.js';

// Ensure the DOM exists before we query elements in Game()
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');

  // Create campaign/scene manager if your files export them.
  // (Your game.js uses optional chaining so it's safe even if these are minimal.)
  const campaign = typeof Campaign === 'function' ? new Campaign() : undefined;
  const sm = typeof SceneManager === 'function' ? new SceneManager() : undefined;

  // Start the game
  const game = new Game(canvas, { mode: 'campaign' }, campaign, sm);

  // Expose for console debugging
  window.game = game;

  // Keyboard shortcuts for UX
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
      // Toggle pause
      game.togglePause();
    }
    if (e.key.toLowerCase() === 'u') {
      // Toggle upgrades
      game.toggleUp();
    }
  });
});
