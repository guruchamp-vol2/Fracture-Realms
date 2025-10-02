// Fracture_Realms_Full_v2/js/boot.js

import { Game } from './game.js';
import { SceneManager } from './scene_manager.js';

let sceneManager;
let game;

function startGame() {
  console.log('=== STARTING GAME ===');
  
  // Enable canvas display
  document.body.classList.add('game-active');
  
  // Hide menu scene
  const menuEl = document.getElementById('menu');
  if (menuEl) {
    menuEl.style.display = 'none';
  }
  
  // Show HUD
  const hudEl = document.getElementById('hud');
  if (hudEl) {
    hudEl.style.display = 'flex';
  }
  
  // Show log
  const logEl = document.getElementById('logWrap');
  if (logEl) {
    logEl.style.display = 'block';
  }

  const canvas = document.getElementById('game');
  game = new Game(canvas, { mode: 'campaign' });
  window.game = game;
  
  // Hotkeys
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'p' && game) game.togglePause();
    if (k === 'u' && game) game.toggleUp();
  });
  
  console.log('=== GAME STARTED ===');
}

function start() {
  console.log('Boot script starting...');
  
  sceneManager = new SceneManager();
  sceneManager.show('menu');

  // Wait for user to click Start Game
  const startBtn = document.getElementById('btnStartGame');
  console.log('Start button:', startBtn);
  
  if (startBtn) {
    // Remove any existing listeners
    const newBtn = startBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newBtn, startBtn);
    
    // Add fresh listener
    newBtn.addEventListener('click', startGame);
    console.log('Start button listener attached');
  } else {
    console.error('❌ Start button NOT found!');
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

// Make startGame globally accessible for inline onclick
window.startGame = startGame;

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
