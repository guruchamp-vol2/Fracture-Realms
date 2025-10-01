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
      console.log('Start Game clicked');
      
      // Hide menu scene
      const menuEl = document.getElementById('menu');
      if (menuEl) {
        menuEl.classList.add('hidden');
        menuEl.classList.remove('active');
      }
      
      // Show HUD
      const hudEl = document.getElementById('hud');
      if (hudEl) {
        hudEl.classList.remove('hidden');
      }
      
      // Show log
      const logEl = document.getElementById('logWrap');
      if (logEl) {
        logEl.classList.remove('hidden');
      }

      const canvas = document.getElementById('game');
      game = new Game(canvas, { mode: 'campaign' });
      window.game = game;
      
      // Hotkeys
      addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'p') game.togglePause();
        if (k === 'u') game.toggleUp();
      });
    }, { once: true }); // Only fire once
  } else {
    console.error('Start button not found!');
  }
  
  // Clear log button
  const clearLogBtn = document.getElementById('btnClearLog');
  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      const log = document.getElementById('log');
      if (log) log.innerHTML = '';
    });
  }
}

addEventListener('DOMContentLoaded', start);
