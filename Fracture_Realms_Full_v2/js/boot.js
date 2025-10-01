// Fracture_Realms_Full_v2/js/boot.js

import { Game } from './game.js';
import { SceneManager } from './scene_manager.js';

let sceneManager;
let game;

function start() {
  sceneManager = new SceneManager();
  sceneManager.show('menu');

  // Wait for user to click Start Game
  const startBtn = document.getElementById('btnStartGame');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // Hide menu, show HUD
      sceneManager.show('hud');
      document.getElementById('menu').classList.add('hidden');
      document.getElementById('menu').classList.remove('active');
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('hud').classList.add('active');

      const canvas = document.getElementById('game');
      game = new Game(canvas, { mode: 'campaign' });
      window.game = game;
      // Hotkeys
      addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'p') game.togglePause();
        if (k === 'u') game.toggleUp();
      });
    });
  }
}

addEventListener('DOMContentLoaded', start);
