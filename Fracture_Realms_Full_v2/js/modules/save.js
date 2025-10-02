// Enhanced Save System for Fracture Realms
// Multiple save slots with comprehensive game state management

export class SaveSystem {
  constructor(game) {
    this.game = game;
    this.maxSaveSlots = 10;
    this.autoSaveInterval = 30000; // 30 seconds
    this.autoSaveTimer = 0;
    this.saveData = new Map();
    
    this.initializeSaveSystem();
  }

  initializeSaveSystem() {
    // Load existing saves
    this.loadAllSaves();
    
    // Set up auto-save
    this.setupAutoSave();
    
    // Set up save/load UI
    this.createSaveUI();
  }

  createSaveUI() {
    // Create save/load overlay
    const overlay = document.createElement('div');
    overlay.id = 'saveLoadPanel';
    overlay.className = 'overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'saveLoadTitle');
    
    overlay.innerHTML = `
      <div class="panel save-load-panel">
        <div class="save-load-header">
          <h2 id="saveLoadTitle">Save & Load</h2>
          <button class="btn ghost close-save-load" aria-label="Close">✕</button>
        </div>
        
        <div class="save-load-content">
          <div class="save-load-tabs">
            <button class="save-load-tab active" data-tab="save">💾 Save Game</button>
            <button class="save-load-tab" data-tab="load">📁 Load Game</button>
            <button class="save-load-tab" data-tab="delete">🗑️ Delete Save</button>
          </div>
          
          <div class="save-load-sections">
            ${this.createSaveSection()}
            ${this.createLoadSection()}
            ${this.createDeleteSection()}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.bindSaveLoadEvents();
  }

  createSaveSection() {
    return `
      <div class="save-load-section" data-section="save">
        <div class="save-slots">
          ${Array.from({ length: this.maxSaveSlots }, (_, i) => `
            <div class="save-slot" data-slot="${i}">
              <div class="save-slot-header">
                <div class="save-slot-name">Save Slot ${i + 1}</div>
                <div class="save-slot-status">Empty</div>
              </div>
              <div class="save-slot-info">
                <div class="save-slot-date">--</div>
                <div class="save-slot-progress">--</div>
              </div>
              <div class="save-slot-actions">
                <button class="btn primary save-slot-btn" data-slot="${i}">Save Here</button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="save-options">
          <label class="save-option">
            <input type="checkbox" id="autoSave" checked>
            <span>Enable Auto-Save</span>
          </label>
          <label class="save-option">
            <input type="checkbox" id="saveScreenshot">
            <span>Include Screenshot</span>
          </label>
        </div>
      </div>
    `;
  }

  createLoadSection() {
    return `
      <div class="save-load-section hidden" data-section="load">
        <div class="load-slots">
          ${Array.from({ length: this.maxSaveSlots }, (_, i) => `
            <div class="load-slot" data-slot="${i}">
              <div class="load-slot-header">
                <div class="load-slot-name">Save Slot ${i + 1}</div>
                <div class="load-slot-status">Empty</div>
              </div>
              <div class="load-slot-info">
                <div class="load-slot-date">--</div>
                <div class="load-slot-progress">--</div>
                <div class="load-slot-stats">
                  <div>Score: --</div>
                  <div>Level: --</div>
                  <div>Time: --</div>
                </div>
              </div>
              <div class="load-slot-actions">
                <button class="btn success load-slot-btn" data-slot="${i}" disabled>Load</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  createDeleteSection() {
    return `
      <div class="save-load-section hidden" data-section="delete">
        <div class="delete-warning">
          <h3>⚠️ Delete Save Files</h3>
          <p>This action cannot be undone. Are you sure you want to delete the selected save files?</p>
        </div>
        
        <div class="delete-slots">
          ${Array.from({ length: this.maxSaveSlots }, (_, i) => `
            <div class="delete-slot" data-slot="${i}">
              <label class="delete-checkbox">
                <input type="checkbox" data-slot="${i}">
                <span>Save Slot ${i + 1}</span>
              </label>
            </div>
          `).join('')}
        </div>
        
        <div class="delete-actions">
          <button class="btn warn" id="deleteSelected">Delete Selected</button>
          <button class="btn" id="selectAll">Select All</button>
          <button class="btn" id="deselectAll">Deselect All</button>
        </div>
      </div>
    `;
  }

  bindSaveLoadEvents() {
    const panel = document.getElementById('saveLoadPanel');
    
    // Tab switching
    panel.querySelectorAll('.save-load-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetSection = tab.dataset.tab;
        this.switchSaveLoadTab(targetSection);
      });
    });
    
    // Close button
    panel.querySelector('.close-save-load').addEventListener('click', () => {
      this.hideSaveLoadPanel();
    });
    
    // Save buttons
    panel.querySelectorAll('.save-slot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slot = parseInt(e.target.dataset.slot);
        this.saveGame(slot);
      });
    });
    
    // Load buttons
    panel.querySelectorAll('.load-slot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slot = parseInt(e.target.dataset.slot);
        this.loadGame(slot);
      });
    });
    
    // Delete buttons
    panel.querySelector('#deleteSelected').addEventListener('click', () => {
      this.deleteSelectedSaves();
    });
    
    panel.querySelector('#selectAll').addEventListener('click', () => {
      panel.querySelectorAll('.delete-checkbox input').forEach(cb => cb.checked = true);
    });
    
    panel.querySelector('#deselectAll').addEventListener('click', () => {
      panel.querySelectorAll('.delete-checkbox input').forEach(cb => cb.checked = false);
    });
    
    // Auto-save toggle
    panel.querySelector('#autoSave').addEventListener('change', (e) => {
      this.autoSaveEnabled = e.target.checked;
    });
  }

  switchSaveLoadTab(targetSection) {
    const panel = document.getElementById('saveLoadPanel');
    
    // Update tabs
    panel.querySelectorAll('.save-load-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetSection);
    });
    
    // Update sections
    panel.querySelectorAll('.save-load-section').forEach(section => {
      section.classList.toggle('hidden', section.dataset.section !== targetSection);
    });
    
    // Update slot displays
    if (targetSection === 'load' || targetSection === 'delete') {
      this.updateSlotDisplays();
    }
  }

  updateSlotDisplays() {
    const panel = document.getElementById('saveLoadPanel');
    
    for (let i = 0; i < this.maxSaveSlots; i++) {
      const saveData = this.saveData.get(i);
      
      // Update save slot
      const saveSlot = panel.querySelector(`.save-slot[data-slot="${i}"]`);
      if (saveSlot) {
        const status = saveSlot.querySelector('.save-slot-status');
        const date = saveSlot.querySelector('.save-slot-date');
        const progress = saveSlot.querySelector('.save-slot-progress');
        
        if (saveData) {
          status.textContent = 'Saved';
          status.className = 'save-slot-status saved';
          date.textContent = new Date(saveData.timestamp).toLocaleString();
          progress.textContent = `Progress: ${saveData.progress || 0}%`;
        } else {
          status.textContent = 'Empty';
          status.className = 'save-slot-status empty';
          date.textContent = '--';
          progress.textContent = '--';
        }
      }
      
      // Update load slot
      const loadSlot = panel.querySelector(`.load-slot[data-slot="${i}"]`);
      if (loadSlot) {
        const status = loadSlot.querySelector('.load-slot-status');
        const date = loadSlot.querySelector('.load-slot-date');
        const progress = loadSlot.querySelector('.load-slot-progress');
        const stats = loadSlot.querySelector('.load-slot-stats');
        const loadBtn = loadSlot.querySelector('.load-slot-btn');
        
        if (saveData) {
          status.textContent = 'Available';
          status.className = 'load-slot-status available';
          date.textContent = new Date(saveData.timestamp).toLocaleString();
          progress.textContent = `Progress: ${saveData.progress || 0}%`;
          stats.innerHTML = `
            <div>Score: ${saveData.gameState?.score || 0}</div>
            <div>Level: ${saveData.gameState?.level || 1}</div>
            <div>Time: ${this.formatTime(saveData.gameState?.playTime || 0)}</div>
          `;
          loadBtn.disabled = false;
        } else {
          status.textContent = 'Empty';
          status.className = 'load-slot-status empty';
          date.textContent = '--';
          progress.textContent = '--';
          stats.innerHTML = '<div>--</div><div>--</div><div>--</div>';
          loadBtn.disabled = true;
        }
      }
    }
  }

  showSaveLoadPanel() {
    const panel = document.getElementById('saveLoadPanel');
    panel.classList.remove('hidden');
    this.updateSlotDisplays();
  }

  hideSaveLoadPanel() {
    const panel = document.getElementById('saveLoadPanel');
    panel.classList.add('hidden');
  }

  saveGame(slot) {
    try {
      const saveData = this.createSaveData();
      this.saveData.set(slot, saveData);
      
      // Save to localStorage
      localStorage.setItem(`fracture_realms_save_${slot}`, JSON.stringify(saveData));
      
      this.game.log(`Game saved to slot ${slot + 1}`, 'ok');
      this.updateSlotDisplays();
      
      // Show save confirmation
      this.showSaveConfirmation(slot);
      
    } catch (e) {
      console.error('Failed to save game:', e);
      this.game.log('Failed to save game!', 'danger');
    }
  }

  loadGame(slot) {
    try {
      const saveData = this.saveData.get(slot);
      if (!saveData) {
        this.game.log('No save data found!', 'warn');
        return;
      }
      
      // Confirm load
      if (!confirm('Load this save? Current progress will be lost!')) {
        return;
      }
      
      this.applySaveData(saveData);
      this.game.log(`Game loaded from slot ${slot + 1}`, 'ok');
      
      // Hide save/load panel
      this.hideSaveLoadPanel();
      
    } catch (e) {
      console.error('Failed to load game:', e);
      this.game.log('Failed to load game!', 'danger');
    }
  }

  createSaveData() {
    const gameState = {
      // Player data
      players: this.game.players.map(player => ({
        id: player.id,
        pos: { ...player.pos },
        vel: { ...player.vel },
        hp: player.hp,
        maxHP: player.maxHP,
        alive: player.alive,
        tint: player.tint,
        enabled: player.enabled
      })),
      
      // Game state
      score: this.game.scoringSystem?.currentScore || 0,
      shardCount: this.game.shardCount,
      realmIndex: this.game.realmIndex,
      timeScale: this.game.timeScale,
      gravDir: this.game.gravDir,
      
      // Progress data
      level: this.game.currentLevel || 1,
      playTime: this.game.playTime || 0,
      progress: this.calculateProgress(),
      
      // Systems data
      achievements: Array.from(this.game.achievements?.unlockedAchievements || []),
      customization: {
        currentSkin: this.game.customization?.currentSkin || 'default',
        currentTrail: this.game.customization?.currentTrail || 'default',
        currentAura: this.game.customization?.currentAura || 'none',
        currentWeapon: this.game.customization?.currentWeapon || 'sword'
      },
      
      // Settings
      settings: this.game.settings?.settings || {},
      
      // Timestamp
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    return gameState;
  }

  applySaveData(saveData) {
    // Restore player data
    saveData.players.forEach((playerData, index) => {
      if (this.game.players[index]) {
        Object.assign(this.game.players[index], playerData);
      }
    });
    
    // Restore game state
    this.game.shardCount = saveData.shardCount;
    this.game.realmIndex = saveData.realmIndex;
    this.game.timeScale = saveData.timeScale;
    this.game.gravDir = saveData.gravDir;
    
    // Restore systems
    if (saveData.achievements && this.game.achievements) {
      this.game.achievements.unlockedAchievements = new Set(saveData.achievements);
    }
    
    if (saveData.customization && this.game.customization) {
      Object.assign(this.game.customization, saveData.customization);
    }
    
    if (saveData.settings && this.game.settings) {
      this.game.settings.settings = { ...this.game.settings.settings, ...saveData.settings };
    }
    
    // Restore scoring
    if (this.game.scoringSystem) {
      this.game.scoringSystem.currentScore = saveData.score;
    }
    
    // Restart game with restored state
    this.game.restartRealm();
  }

  calculateProgress() {
    // Calculate overall game progress
    const totalRealms = this.game.realms?.list?.length || 8;
    const completedRealms = this.game.completedRealms || 0;
    const achievements = this.game.achievements?.getProgress() || { percentage: 0 };
    
    return Math.round((completedRealms / totalRealms) * 50 + achievements.percentage * 0.5);
  }

  setupAutoSave() {
    this.autoSaveEnabled = true;
    this.autoSaveTimer = 0;
  }

  updateAutoSave(deltaTime) {
    if (!this.autoSaveEnabled) return;
    
    this.autoSaveTimer += deltaTime * 1000;
    
    if (this.autoSaveTimer >= this.autoSaveInterval) {
      this.autoSave();
      this.autoSaveTimer = 0;
    }
  }

  autoSave() {
    // Auto-save to slot 0
    this.saveGame(0);
    this.game.log('Auto-save completed', 'ok');
  }

  deleteSelectedSaves() {
    const panel = document.getElementById('saveLoadPanel');
    const selectedSlots = Array.from(panel.querySelectorAll('.delete-checkbox input:checked'))
      .map(cb => parseInt(cb.dataset.slot));
    
    if (selectedSlots.length === 0) {
      this.game.log('No saves selected for deletion', 'warn');
      return;
    }
    
    if (!confirm(`Delete ${selectedSlots.length} save file(s)? This cannot be undone!`)) {
      return;
    }
    
    selectedSlots.forEach(slot => {
      this.saveData.delete(slot);
      localStorage.removeItem(`fracture_realms_save_${slot}`);
    });
    
    this.game.log(`Deleted ${selectedSlots.length} save file(s)`, 'ok');
    this.updateSlotDisplays();
  }

  loadAllSaves() {
    for (let i = 0; i < this.maxSaveSlots; i++) {
      try {
        const saved = localStorage.getItem(`fracture_realms_save_${i}`);
        if (saved) {
          const saveData = JSON.parse(saved);
          this.saveData.set(i, saveData);
        }
      } catch (e) {
        console.warn(`Could not load save slot ${i}:`, e);
      }
    }
  }

  showSaveConfirmation(slot) {
    const confirmation = document.createElement('div');
    confirmation.className = 'save-confirmation';
    confirmation.innerHTML = `
      <div class="confirmation-content">
        <div class="confirmation-icon">💾</div>
        <div class="confirmation-text">
          <div class="confirmation-title">Game Saved!</div>
          <div class="confirmation-details">Slot ${slot + 1} • ${new Date().toLocaleString()}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmation);
    
    setTimeout(() => confirmation.classList.add('show'), 100);
    setTimeout(() => {
      confirmation.classList.remove('show');
      setTimeout(() => document.body.removeChild(confirmation), 500);
    }, 2000);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  exportSave(slot) {
    const saveData = this.saveData.get(slot);
    if (!saveData) {
      this.game.log('No save data to export!', 'warn');
      return;
    }
    
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fracture_realms_save_${slot + 1}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.game.log(`Save slot ${slot + 1} exported`, 'ok');
  }

  importSave(slot, file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result);
        this.saveData.set(slot, saveData);
        localStorage.setItem(`fracture_realms_save_${slot}`, JSON.stringify(saveData));
        this.updateSlotDisplays();
        this.game.log(`Save slot ${slot + 1} imported`, 'ok');
      } catch (error) {
        this.game.log('Invalid save file!', 'danger');
      }
    };
    reader.readAsText(file);
  }
}

// Save system is now ready to use
.save-load-panel {
  width: min(900px, 95vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.save-load-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid #253553;
}

.save-load-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.save-load-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #253553;
}

.save-load-tab {
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.save-load-tab:hover {
  color: var(--ink);
  background: rgba(100, 181, 246, 0.1);
}

.save-load-tab.active {
  color: var(--acc);
  border-bottom-color: var(--acc);
}

.save-load-section {
  display: grid;
  gap: 16px;
}

.save-slots, .load-slots, .delete-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.save-slot, .load-slot {
  border: 2px solid #253553;
  border-radius: 8px;
  padding: 16px;
  background: rgba(16, 28, 49, 0.6);
  transition: all 0.2s;
}

.save-slot:hover, .load-slot:hover {
  border-color: #3a4b68;
  background: rgba(16, 28, 49, 0.8);
}

.save-slot-header, .load-slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.save-slot-name, .load-slot-name {
  font-weight: bold;
  color: #ffffff;
}

.save-slot-status, .load-slot-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.save-slot-status.saved, .load-slot-status.available {
  background: #4caf50;
  color: #ffffff;
}

.save-slot-status.empty, .load-slot-status.empty {
  background: #666666;
  color: #ffffff;
}

.save-slot-info, .load-slot-info {
  margin-bottom: 12px;
}

.save-slot-date, .load-slot-date {
  color: #cccccc;
  font-size: 12px;
  margin-bottom: 4px;
}

.save-slot-progress, .load-slot-progress {
  color: #64b5f6;
  font-size: 12px;
  font-weight: bold;
}

.load-slot-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
  color: #cccccc;
}

.save-slot-actions, .load-slot-actions {
  text-align: center;
}

.save-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(16, 28, 49, 0.4);
  border-radius: 8px;
}

.save-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.save-option input {
  margin: 0;
}

.delete-warning {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.delete-warning h3 {
  color: #f44336;
  margin-bottom: 8px;
}

.delete-warning p {
  color: #cccccc;
  margin: 0;
}

.delete-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.delete-slot {
  padding: 12px;
  background: rgba(16, 28, 49, 0.4);
  border-radius: 8px;
  border: 1px solid #253553;
}

.delete-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.delete-checkbox input {
  margin: 0;
}

.delete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.save-confirmation {
  position: fixed;
  top: 100px;
  right: -300px;
  width: 250px;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.save-confirmation.show {
  right: 16px;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirmation-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.confirmation-text {
  flex: 1;
}

.confirmation-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2px;
}

.confirmation-details {
  font-size: 0.8rem;
  color: #c8e6c9;
}
`;
