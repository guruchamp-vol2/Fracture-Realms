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
      sceneManager.show('hud');
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
