// Comprehensive Settings System for Fracture Realms

export class SettingsSystem {
  constructor(game) {
    this.game = game;
    this.settings = {
      // Audio Settings
      masterVolume: 0.8,
      soundEffectsVolume: 0.8,
      musicVolume: 0.6,
      muteAudio: false,
      
      // Video Settings
      particleQuality: 'high', // low, medium, high, ultra
      screenShake: true,
      fullscreen: false,
      vsync: true,
      showFPS: false,
      
      // Gameplay Settings
      difficulty: 'normal', // easy, normal, hard, nightmare
      assistMode: false,
      autoAim: false,
      quickRestart: true,
      pauseOnFocusLoss: true,
      
      // Controls Settings
      keyBindings: {
        moveLeft: 'a',
        moveRight: 'd',
        jump: 'w',
        meleeAttack: 'j',
        magicAttack: 'k',
        dash: 'l',
        grapple: 'e',
        upgrades: 'u',
        pause: 'p',
        screenshot: 'f12'
      },
      gamepadEnabled: true,
      gamepadDeadzone: 0.15,
      gamepadSensitivity: 1.0,
      
      // Accessibility Settings
      colorBlindMode: 'none', // none, protanopia, deuteranopia, tritanopia
      highContrast: false,
      reducedMotion: false,
      largerUI: false,
      subtitles: true,
      
      // Advanced Settings
      maxFPS: 60,
      renderScale: 1.0,
      antialias: true,
      debugMode: false,
      developerConsole: false
    };
    
    this.originalSettings = { ...this.settings };
    this.loadSettings();
    this.applySettings();
    
    this.settingsPanel = null;
    this.createSettingsPanel();
  }

  createSettingsPanel() {
    // Create settings overlay
    const overlay = document.createElement('div');
    overlay.id = 'settingsPanel';
    overlay.className = 'overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'settingsTitle');
    
    overlay.innerHTML = `
      <div class="panel settings-panel">
        <div class="settings-header">
          <h2 id="settingsTitle">Settings</h2>
          <button class="btn ghost close-settings" aria-label="Close Settings">✕</button>
        </div>
        
        <div class="settings-content">
          <div class="settings-tabs">
            <button class="settings-tab active" data-tab="audio">🔊 Audio</button>
            <button class="settings-tab" data-tab="video">🎨 Video</button>
            <button class="settings-tab" data-tab="gameplay">🎮 Gameplay</button>
            <button class="settings-tab" data-tab="controls">⌨️ Controls</button>
            <button class="settings-tab" data-tab="accessibility">♿ Accessibility</button>
            <button class="settings-tab" data-tab="advanced">⚙️ Advanced</button>
          </div>
          
          <div class="settings-sections">
            ${this.createAudioSettings()}
            ${this.createVideoSettings()}
            ${this.createGameplaySettings()}
            ${this.createControlsSettings()}
            ${this.createAccessibilitySettings()}
            ${this.createAdvancedSettings()}
          </div>
        </div>
        
        <div class="settings-footer">
          <button class="btn ghost" id="resetSettings">Reset to Defaults</button>
          <button class="btn ghost" id="exportSettings">Export Settings</button>
          <button class="btn ghost" id="importSettings">Import Settings</button>
          <div class="settings-actions">
            <button class="btn" id="cancelSettings">Cancel</button>
            <button class="btn primary" id="applySettings">Apply</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.settingsPanel = overlay;
    
    this.bindSettingsEvents();
  }

  createAudioSettings() {
    return `
      <div class="settings-section" data-section="audio">
        <div class="setting-group">
          <label for="masterVolume">Master Volume</label>
          <input type="range" id="masterVolume" min="0" max="1" step="0.1" value="${this.settings.masterVolume}">
          <span class="setting-value">${Math.round(this.settings.masterVolume * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label for="soundEffectsVolume">Sound Effects</label>
          <input type="range" id="soundEffectsVolume" min="0" max="1" step="0.1" value="${this.settings.soundEffectsVolume}">
          <span class="setting-value">${Math.round(this.settings.soundEffectsVolume * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label for="musicVolume">Music Volume</label>
          <input type="range" id="musicVolume" min="0" max="1" step="0.1" value="${this.settings.musicVolume}">
          <span class="setting-value">${Math.round(this.settings.musicVolume * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="muteAudio" ${this.settings.muteAudio ? 'checked' : ''}>
            <span>Mute All Audio</span>
          </label>
        </div>
      </div>
    `;
  }

  createVideoSettings() {
    return `
      <div class="settings-section hidden" data-section="video">
        <div class="setting-group">
          <label for="particleQuality">Particle Quality</label>
          <select id="particleQuality">
            <option value="low" ${this.settings.particleQuality === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${this.settings.particleQuality === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${this.settings.particleQuality === 'high' ? 'selected' : ''}>High</option>
            <option value="ultra" ${this.settings.particleQuality === 'ultra' ? 'selected' : ''}>Ultra</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="screenShake" ${this.settings.screenShake ? 'checked' : ''}>
            <span>Screen Shake</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="showFPS" ${this.settings.showFPS ? 'checked' : ''}>
            <span>Show FPS Counter</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label for="renderScale">Render Scale</label>
          <input type="range" id="renderScale" min="0.5" max="2.0" step="0.1" value="${this.settings.renderScale}">
          <span class="setting-value">${Math.round(this.settings.renderScale * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label for="maxFPS">Max FPS</label>
          <select id="maxFPS">
            <option value="30" ${this.settings.maxFPS === 30 ? 'selected' : ''}>30 FPS</option>
            <option value="60" ${this.settings.maxFPS === 60 ? 'selected' : ''}>60 FPS</option>
            <option value="120" ${this.settings.maxFPS === 120 ? 'selected' : ''}>120 FPS</option>
            <option value="144" ${this.settings.maxFPS === 144 ? 'selected' : ''}>144 FPS</option>
            <option value="0" ${this.settings.maxFPS === 0 ? 'selected' : ''}>Unlimited</option>
          </select>
        </div>
      </div>
    `;
  }

  createGameplaySettings() {
    return `
      <div class="settings-section hidden" data-section="gameplay">
        <div class="setting-group">
          <label for="difficulty">Difficulty</label>
          <select id="difficulty">
            <option value="easy" ${this.settings.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
            <option value="normal" ${this.settings.difficulty === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="hard" ${this.settings.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
            <option value="nightmare" ${this.settings.difficulty === 'nightmare' ? 'selected' : ''}>Nightmare</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="assistMode" ${this.settings.assistMode ? 'checked' : ''}>
            <span>Assist Mode (Slower platform breaking)</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="autoAim" ${this.settings.autoAim ? 'checked' : ''}>
            <span>Auto-Aim Assistance</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="quickRestart" ${this.settings.quickRestart ? 'checked' : ''}>
            <span>Quick Restart on Death</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="pauseOnFocusLoss" ${this.settings.pauseOnFocusLoss ? 'checked' : ''}>
            <span>Pause When Window Loses Focus</span>
          </label>
        </div>
      </div>
    `;
  }

  createControlsSettings() {
    return `
      <div class="settings-section hidden" data-section="controls">
        <div class="controls-grid">
          ${Object.entries(this.settings.keyBindings).map(([action, key]) => `
            <div class="setting-group key-binding">
              <label>${this.getActionDisplayName(action)}</label>
              <button class="key-bind-button" data-action="${action}">${key.toUpperCase()}</button>
            </div>
          `).join('')}
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="gamepadEnabled" ${this.settings.gamepadEnabled ? 'checked' : ''}>
            <span>Enable Gamepad</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label for="gamepadDeadzone">Gamepad Deadzone</label>
          <input type="range" id="gamepadDeadzone" min="0" max="0.5" step="0.05" value="${this.settings.gamepadDeadzone}">
          <span class="setting-value">${Math.round(this.settings.gamepadDeadzone * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label for="gamepadSensitivity">Gamepad Sensitivity</label>
          <input type="range" id="gamepadSensitivity" min="0.5" max="2.0" step="0.1" value="${this.settings.gamepadSensitivity}">
          <span class="setting-value">${Math.round(this.settings.gamepadSensitivity * 100)}%</span>
        </div>
      </div>
    `;
  }

  createAccessibilitySettings() {
    return `
      <div class="settings-section hidden" data-section="accessibility">
        <div class="setting-group">
          <label for="colorBlindMode">Color Blind Support</label>
          <select id="colorBlindMode">
            <option value="none" ${this.settings.colorBlindMode === 'none' ? 'selected' : ''}>None</option>
            <option value="protanopia" ${this.settings.colorBlindMode === 'protanopia' ? 'selected' : ''}>Protanopia</option>
            <option value="deuteranopia" ${this.settings.colorBlindMode === 'deuteranopia' ? 'selected' : ''}>Deuteranopia</option>
            <option value="tritanopia" ${this.settings.colorBlindMode === 'tritanopia' ? 'selected' : ''}>Tritanopia</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="highContrast" ${this.settings.highContrast ? 'checked' : ''}>
            <span>High Contrast Mode</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="reducedMotion" ${this.settings.reducedMotion ? 'checked' : ''}>
            <span>Reduce Motion Effects</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="largerUI" ${this.settings.largerUI ? 'checked' : ''}>
            <span>Larger UI Elements</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="subtitles" ${this.settings.subtitles ? 'checked' : ''}>
            <span>Show Subtitles</span>
          </label>
        </div>
      </div>
    `;
  }

  createAdvancedSettings() {
    return `
      <div class="settings-section hidden" data-section="advanced">
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="debugMode" ${this.settings.debugMode ? 'checked' : ''}>
            <span>Debug Mode</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="developerConsole" ${this.settings.developerConsole ? 'checked' : ''}>
            <span>Developer Console</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="antialias" ${this.settings.antialias ? 'checked' : ''}>
            <span>Anti-aliasing</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" id="vsync" ${this.settings.vsync ? 'checked' : ''}>
            <span>V-Sync</span>
          </label>
        </div>
        
        <div class="setting-info">
          <p><strong>Performance Info:</strong></p>
          <p>Device: ${navigator.userAgent}</p>
          <p>Memory: ${navigator.deviceMemory || 'Unknown'} GB</p>
          <p>Cores: ${navigator.hardwareConcurrency || 'Unknown'}</p>
        </div>
      </div>
    `;
  }

  bindSettingsEvents() {
    const panel = this.settingsPanel;
    
    // Tab switching
    panel.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetSection = tab.dataset.tab;
        this.switchSettingsTab(targetSection);
      });
    });
    
    // Close button
    panel.querySelector('.close-settings').addEventListener('click', () => {
      this.hideSettings();
    });
    
    // Footer buttons
    panel.querySelector('#resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });
    
    panel.querySelector('#exportSettings').addEventListener('click', () => {
      this.exportSettings();
    });
    
    panel.querySelector('#importSettings').addEventListener('click', () => {
      this.importSettings();
    });
    
    panel.querySelector('#cancelSettings').addEventListener('click', () => {
      this.hideSettings();
    });
    
    panel.querySelector('#applySettings').addEventListener('click', () => {
      this.applySettingsFromPanel();
    });
    
    // Range inputs
    panel.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const valueSpan = e.target.parentElement.querySelector('.setting-value');
        if (valueSpan) {
          const value = parseFloat(e.target.value);
          valueSpan.textContent = Math.round(value * 100) + '%';
        }
      });
    });
    
    // Key binding buttons
    panel.querySelectorAll('.key-bind-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.startKeyBinding(e.target);
      });
    });
    
    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
        this.hideSettings();
      }
    });
  }

  switchSettingsTab(targetSection) {
    const panel = this.settingsPanel;
    
    // Update tabs
    panel.querySelectorAll('.settings-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetSection);
    });
    
    // Update sections
    panel.querySelectorAll('.settings-section').forEach(section => {
      section.classList.toggle('hidden', section.dataset.section !== targetSection);
    });
  }

  showSettings() {
    if (this.settingsPanel) {
      this.settingsPanel.classList.remove('hidden');
      this.updateSettingsPanel();
    }
  }

  hideSettings() {
    if (this.settingsPanel) {
      this.settingsPanel.classList.add('hidden');
    }
  }

  updateSettingsPanel() {
    const panel = this.settingsPanel;
    
    // Update all input values
    Object.entries(this.settings).forEach(([key, value]) => {
      const input = panel.querySelector(`#${key}`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value;
        } else if (input.type === 'range') {
          input.value = value;
          const valueSpan = input.parentElement.querySelector('.setting-value');
          if (valueSpan) {
            valueSpan.textContent = Math.round(value * 100) + '%';
          }
        } else {
          input.value = value;
        }
      }
    });
  }

  applySettingsFromPanel() {
    const panel = this.settingsPanel;
    const newSettings = { ...this.settings };
    
    // Collect all settings from the panel
    panel.querySelectorAll('input, select').forEach(input => {
      const key = input.id;
      if (key && this.settings.hasOwnProperty(key)) {
        if (input.type === 'checkbox') {
          newSettings[key] = input.checked;
        } else if (input.type === 'range') {
          newSettings[key] = parseFloat(input.value);
        } else if (input.type === 'number') {
          newSettings[key] = parseInt(input.value);
        } else {
          newSettings[key] = input.value;
        }
      }
    });
    
    this.settings = newSettings;
    this.applySettings();
    this.saveSettings();
    this.hideSettings();
    
    this.game.log('Settings applied successfully', 'ok');
  }

  applySettings() {
    // Apply audio settings
    if (this.game.audio) {
      this.game.audio.muted = this.settings.muteAudio;
      this.game.audio.masterVolume = this.settings.masterVolume;
    }
    
    // Apply video settings
    this.game.screenShake = this.settings.screenShake;
    this.game.particlesOn = this.settings.particleQuality !== 'low';
    
    // Apply gameplay settings
    this.game.assist = this.settings.assistMode;
    
    // Apply controls settings
    if (this.game.input) {
      this.game.input.gamepadEnabled = this.settings.gamepadEnabled;
    }
    
    // Apply accessibility settings
    this.applyAccessibilitySettings();
    
    // Apply advanced settings
    if (this.settings.debugMode) {
      window.DEBUG_MODE = true;
    }
  }

  applyAccessibilitySettings() {
    const body = document.body;
    
    // Color blind mode
    body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (this.settings.colorBlindMode !== 'none') {
      body.classList.add(this.settings.colorBlindMode);
    }
    
    // High contrast
    body.classList.toggle('high-contrast', this.settings.highContrast);
    
    // Reduced motion
    body.classList.toggle('reduced-motion', this.settings.reducedMotion);
    
    // Larger UI
    body.classList.toggle('larger-ui', this.settings.largerUI);
  }

  startKeyBinding(button) {
    const action = button.dataset.action;
    button.textContent = 'Press Key...';
    button.classList.add('binding');
    
    const handleKeyPress = (e) => {
      e.preventDefault();
      
      const key = e.key.toLowerCase();
      this.settings.keyBindings[action] = key;
      button.textContent = key.toUpperCase();
      button.classList.remove('binding');
      
      document.removeEventListener('keydown', handleKeyPress);
    };
    
    document.addEventListener('keydown', handleKeyPress);
  }

  getActionDisplayName(action) {
    const displayNames = {
      moveLeft: 'Move Left',
      moveRight: 'Move Right',
      jump: 'Jump',
      meleeAttack: 'Melee Attack',
      magicAttack: 'Magic Attack',
      dash: 'Dash',
      grapple: 'Grapple',
      upgrades: 'Upgrades',
      pause: 'Pause',
      screenshot: 'Screenshot'
    };
    return displayNames[action] || action;
  }

  resetSettings() {
    if (confirm('Reset all settings to default values?')) {
      this.settings = { ...this.originalSettings };
      this.updateSettingsPanel();
      this.applySettings();
      this.saveSettings();
    }
  }

  exportSettings() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fracture_realms_settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          this.settings = { ...this.settings, ...importedSettings };
          this.updateSettingsPanel();
          this.applySettings();
          this.saveSettings();
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Invalid settings file!');
        }
      };
      reader.readAsText(file);
    });
    
    input.click();
  }

  saveSettings() {
    try {
      localStorage.setItem('fracture_realms_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('fracture_realms_settings');
      if (saved) {
        const loadedSettings = JSON.parse(saved);
        this.settings = { ...this.settings, ...loadedSettings };
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
  }

  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, value) {
    this.settings[key] = value;
    this.applySettings();
    this.saveSettings();
  }
}

// CSS for settings panel (to be added to styles.css)
export const settingsStyles = `
.settings-panel {
  width: min(800px, 95vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid #253553;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #253553;
}

.settings-tab {
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.settings-tab:hover {
  color: var(--ink);
  background: rgba(100, 181, 246, 0.1);
}

.settings-tab.active {
  color: var(--acc);
  border-bottom-color: var(--acc);
}

.settings-section {
  display: grid;
  gap: 16px;
}

.setting-group {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #253553;
  border-radius: 8px;
}

.setting-group label {
  font-weight: 500;
}

.setting-checkbox {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-checkbox input {
  margin: 0;
}

.setting-value {
  min-width: 40px;
  text-align: right;
  font-weight: 600;
  color: var(--acc);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.key-bind-button {
  min-width: 60px;
  padding: 4px 8px;
  background: var(--bg2);
  border: 1px solid #253553;
  color: var(--ink);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.key-bind-button:hover {
  border-color: var(--acc);
}

.key-bind-button.binding {
  background: var(--acc);
  color: var(--bg0);
}

.settings-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 2px solid #253553;
}

.settings-actions {
  display: flex;
  gap: 8px;
}

.setting-info {
  grid-column: 1 / -1;
  padding: 12px;
  background: rgba(100, 181, 246, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
}

.setting-info p {
  margin: 4px 0;
}
`;
