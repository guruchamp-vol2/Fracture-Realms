// Story Mode System for Fracture Realms
// Narrative progression with cutscenes and dialogue

export class StorySystem {
  constructor(game) {
    this.game = game;
    this.currentChapter = 0;
    this.storyProgress = 0;
    this.cutsceneActive = false;
    this.dialogueActive = false;
    this.storyData = null;
    
    this.initializeStory();
  }

  initializeStory() {
    this.storyData = {
      chapters: [
        {
          id: 'prologue',
          title: 'The Fracture Begins',
          description: 'A mysterious rift tears through reality...',
          cutscenes: [
            {
              id: 'opening',
              type: 'cinematic',
              duration: 8,
              script: [
                { speaker: 'Narrator', text: 'In the beginning, there was unity...', time: 0 },
                { speaker: 'Narrator', text: 'But then came the Fracture.', time: 2 },
                { speaker: 'Narrator', text: 'Reality split into fragments...', time: 4 },
                { speaker: 'Narrator', text: 'And you are the key to mending it.', time: 6 }
              ],
              effects: [
                { type: 'fadeIn', duration: 1 },
                { type: 'particleStorm', startTime: 2, duration: 3 },
                { type: 'screenShake', startTime: 4, intensity: 10 },
                { type: 'fadeOut', duration: 1 }
              ]
            }
          ],
          objectives: [
            { id: 'survive_tutorial', description: 'Survive your first encounter', type: 'survival', target: 30 },
            { id: 'collect_shards', description: 'Collect 10 shards', type: 'collect', target: 10 }
          ]
        },
        
        {
          id: 'awakening',
          title: 'Awakening',
          description: 'You awaken in a fractured realm...',
          cutscenes: [
            {
              id: 'awakening',
              type: 'dialogue',
              duration: 12,
              script: [
                { speaker: 'Mysterious Voice', text: 'You have been chosen...', time: 0 },
                { speaker: 'Mysterious Voice', text: 'The realms are in chaos.', time: 2 },
                { speaker: 'Mysterious Voice', text: 'Only you can restore balance.', time: 4 },
                { speaker: 'Player', text: 'Who are you?', time: 6 },
                { speaker: 'Mysterious Voice', text: 'I am the Guardian of the Realms.', time: 8 },
                { speaker: 'Mysterious Voice', text: 'Now, prove yourself worthy.', time: 10 }
              ],
              effects: [
                { type: 'characterAppear', character: 'guardian', startTime: 1 },
                { type: 'lightEffect', startTime: 3, duration: 6 }
              ]
            }
          ],
          objectives: [
            { id: 'defeat_first_boss', description: 'Defeat the Guardian', type: 'boss', target: 1 },
            { id: 'master_gravity', description: 'Use gravity flip 5 times', type: 'ability', target: 5 }
          ]
        },
        
        {
          id: 'realms',
          title: 'The Shattered Realms',
          description: 'Journey through the fractured dimensions...',
          cutscenes: [
            {
              id: 'realm_intro',
              type: 'cinematic',
              duration: 15,
              script: [
                { speaker: 'Guardian', text: 'Each realm holds a fragment of the original world.', time: 0 },
                { speaker: 'Guardian', text: 'You must traverse them all.', time: 3 },
                { speaker: 'Guardian', text: 'But beware... each realm has its own dangers.', time: 6 },
                { speaker: 'Guardian', text: 'The Chrono Gully bends time itself.', time: 9 },
                { speaker: 'Guardian', text: 'The Ember Vault burns with eternal fire.', time: 12 }
              ],
              effects: [
                { type: 'realmTransition', realm: 'chrono', startTime: 8 },
                { type: 'realmTransition', realm: 'ember', startTime: 11 }
              ]
            }
          ],
          objectives: [
            { id: 'visit_all_realms', description: 'Visit all 8 realms', type: 'exploration', target: 8 },
            { id: 'defeat_realm_bosses', description: 'Defeat bosses in each realm', type: 'boss', target: 8 }
          ]
        },
        
        {
          id: 'climax',
          title: 'The Final Confrontation',
          description: 'Face the source of the Fracture...',
          cutscenes: [
            {
              id: 'final_battle',
              type: 'cinematic',
              duration: 20,
              script: [
                { speaker: 'Guardian', text: 'You have proven yourself worthy.', time: 0 },
                { speaker: 'Guardian', text: 'But the true test lies ahead.', time: 3 },
                { speaker: 'Guardian', text: 'The Fracture King awaits...', time: 6 },
                { speaker: 'Fracture King', text: 'You cannot stop what has begun!', time: 9 },
                { speaker: 'Player', text: 'We will see about that!', time: 12 },
                { speaker: 'Guardian', text: 'The fate of all realms rests with you.', time: 15 }
              ],
              effects: [
                { type: 'bossReveal', boss: 'fracture_king', startTime: 8 },
                { type: 'epicMusic', startTime: 10 },
                { type: 'screenShake', startTime: 12, intensity: 15 }
              ]
            }
          ],
          objectives: [
            { id: 'defeat_fracture_king', description: 'Defeat the Fracture King', type: 'boss', target: 1 },
            { id: 'restore_realms', description: 'Restore all realms to unity', type: 'restoration', target: 8 }
          ]
        }
      ],
      
      characters: {
        guardian: {
          name: 'The Guardian',
          description: 'Ancient protector of the realms',
          voice: 'deep',
          color: '#64b5f6'
        },
        fracture_king: {
          name: 'The Fracture King',
          description: 'Malevolent entity causing the chaos',
          voice: 'dark',
          color: '#f44336'
        },
        narrator: {
          name: 'Narrator',
          description: 'Omniscient storyteller',
          voice: 'neutral',
          color: '#ffffff'
        }
      }
    };
  }

  startStory() {
    this.game.log('Story mode activated', 'ok');
    this.currentChapter = 0;
    this.storyProgress = 0;
    this.playCutscene(this.storyData.chapters[0].cutscenes[0]);
  }

  playCutscene(cutscene) {
    this.cutsceneActive = true;
    this.game.paused = true;
    
    // Create cutscene overlay
    const overlay = document.createElement('div');
    overlay.className = 'cutscene-overlay';
    overlay.innerHTML = `
      <div class="cutscene-container">
        <div class="cutscene-content">
          <div class="cutscene-text">
            <div class="speaker"></div>
            <div class="dialogue"></div>
          </div>
          <div class="cutscene-controls">
            <button class="btn ghost skip-cutscene">Skip</button>
            <button class="btn primary next-dialogue">Next</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Start cutscene sequence
    this.playCutsceneSequence(cutscene, overlay);
  }

  playCutsceneSequence(cutscene, overlay) {
    let currentLine = 0;
    const lines = cutscene.script;
    
    const showNextLine = () => {
      if (currentLine >= lines.length) {
        this.endCutscene(overlay);
        return;
      }
      
      const line = lines[currentLine];
      const speakerEl = overlay.querySelector('.speaker');
      const dialogueEl = overlay.querySelector('.dialogue');
      
      speakerEl.textContent = line.speaker;
      dialogueEl.textContent = line.text;
      
      // Apply character styling
      const character = this.storyData.characters[line.speaker.toLowerCase().replace(' ', '_')];
      if (character) {
        speakerEl.style.color = character.color;
      }
      
      // Apply effects
      this.applyCutsceneEffects(cutscene.effects, line.time);
      
      currentLine++;
      
      // Auto-advance after delay
      setTimeout(showNextLine, 2000);
    };
    
    // Start the sequence
    showNextLine();
    
    // Manual controls
    overlay.querySelector('.next-dialogue').addEventListener('click', showNextLine);
    overlay.querySelector('.skip-cutscene').addEventListener('click', () => {
      this.endCutscene(overlay);
    });
  }

  applyCutsceneEffects(effects, currentTime) {
    effects.forEach(effect => {
      if (effect.startTime <= currentTime && currentTime < effect.startTime + effect.duration) {
        switch (effect.type) {
          case 'fadeIn':
            this.game.particleSystem?.createMagicSparkles(
              this.game.W / 2,
              this.game.H / 2,
              { count: 50, colors: ['#e1bee7', '#ce93d8'] }
            );
            break;
            
          case 'particleStorm':
            for (let i = 0; i < 100; i++) {
              this.game.particleSystem?.createParticle({
                x: Math.random() * this.game.W,
                y: Math.random() * this.game.H,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                color: '#64b5f6',
                size: 3,
                life: 2.0,
                type: 'storm'
              });
            }
            break;
            
          case 'screenShake':
            this.game.shake(effect.intensity, 1000);
            break;
            
          case 'characterAppear':
            this.game.particleSystem?.createExplosion(
              this.game.W / 2,
              this.game.H / 2,
              { color: '#64b5f6', count: 30 }
            );
            break;
            
          case 'lightEffect':
            this.game.particleSystem?.createEnergyField(
              this.game.W / 2,
              this.game.H / 2,
              300,
              {
                rate: 20,
                life: effect.duration,
                particleOptions: {
                  color: '#ffeb3b',
                  size: 4,
                  life: 1.0,
                  orbital: true
                }
              }
            );
            break;
        }
      }
    });
  }

  endCutscene(overlay) {
    this.cutsceneActive = false;
    this.game.paused = false;
    document.body.removeChild(overlay);
    
    // Check for story progression
    this.checkStoryProgression();
  }

  checkStoryProgression() {
    const chapter = this.storyData.chapters[this.currentChapter];
    if (!chapter) return;
    
    // Check objectives
    const completedObjectives = this.checkObjectives(chapter.objectives);
    
    if (completedObjectives === chapter.objectives.length) {
      this.completeChapter();
    }
  }

  checkObjectives(objectives) {
    let completed = 0;
    
    objectives.forEach(objective => {
      switch (objective.type) {
        case 'survival':
          if (this.game.players[0].survivalTime >= objective.target) {
            completed++;
          }
          break;
          
        case 'collect':
          if (this.game.shardCount >= objective.target) {
            completed++;
          }
          break;
          
        case 'boss':
          if (this.game.bossesDefeated >= objective.target) {
            completed++;
          }
          break;
          
        case 'ability':
          if (this.game.gravityFlipsUsed >= objective.target) {
            completed++;
          }
          break;
          
        case 'exploration':
          if (this.game.realmsVisited >= objective.target) {
            completed++;
          }
          break;
      }
    });
    
    return completed;
  }

  completeChapter() {
    this.currentChapter++;
    this.storyProgress = (this.currentChapter / this.storyData.chapters.length) * 100;
    
    this.game.log(`Chapter ${this.currentChapter} completed!`, 'ok');
    
    // Show chapter completion
    this.showChapterCompletion();
    
    // Start next chapter if available
    if (this.currentChapter < this.storyData.chapters.length) {
      setTimeout(() => {
        this.playCutscene(this.storyData.chapters[this.currentChapter].cutscenes[0]);
      }, 3000);
    } else {
      this.completeStory();
    }
  }

  showChapterCompletion() {
    const chapter = this.storyData.chapters[this.currentChapter - 1];
    
    const completion = document.createElement('div');
    completion.className = 'chapter-completion';
    completion.innerHTML = `
      <div class="completion-content">
        <h2>Chapter Complete!</h2>
        <h3>${chapter.title}</h3>
        <p>${chapter.description}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${this.storyProgress}%"></div>
        </div>
        <p>Story Progress: ${Math.round(this.storyProgress)}%</p>
      </div>
    `;
    
    document.body.appendChild(completion);
    
    setTimeout(() => {
      document.body.removeChild(completion);
    }, 4000);
  }

  completeStory() {
    this.game.log('🎉 Story Complete! You have restored the realms!', 'ok');
    
    // Show ending cutscene
    this.showEnding();
  }

  showEnding() {
    const ending = document.createElement('div');
    ending.className = 'story-ending';
    ending.innerHTML = `
      <div class="ending-content">
        <h1>The Fracture is Healed</h1>
        <p>Through your courage and determination, you have restored balance to all realms.</p>
        <p>The Guardian's faith in you was not misplaced.</p>
        <p>But new challenges may arise...</p>
        <div class="ending-actions">
          <button class="btn primary" onclick="this.parentElement.parentElement.parentElement.remove()">Continue</button>
          <button class="btn" onclick="window.location.reload()">New Game+</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(ending);
  }

  renderStoryUI(ctx) {
    if (!this.cutsceneActive) return;
    
    ctx.save();
    
    // Story progress indicator
    const x = 20;
    const y = this.game.H - 100;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, 300, 60);
    
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 300, 60);
    
    // Chapter info
    const chapter = this.storyData.chapters[this.currentChapter];
    if (chapter) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(chapter.title, x + 10, y + 20);
      
      ctx.fillStyle = '#cccccc';
      ctx.font = '12px sans-serif';
      ctx.fillText(chapter.description, x + 10, y + 35);
      
      // Progress bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x + 10, y + 45, 280, 8);
      
      ctx.fillStyle = '#64b5f6';
      ctx.fillRect(x + 10, y + 45, 280 * (this.storyProgress / 100), 8);
    }
    
    ctx.restore();
  }
}

// CSS for story system (to be added to styles.css)
export const storyStyles = `
.cutscene-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cutscene-container {
  width: min(800px, 90vw);
  max-height: 80vh;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  border: 2px solid #7986cb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.cutscene-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cutscene-text {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.speaker {
  font-size: 18px;
  font-weight: bold;
  color: #64b5f6;
  margin-bottom: 8px;
}

.dialogue {
  font-size: 16px;
  line-height: 1.4;
  color: #ffffff;
}

.cutscene-controls {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.chapter-completion {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-content {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.completion-content h2 {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #ffffff;
}

.completion-content h3 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #c8e6c9;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  margin: 16px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.5s ease;
}

.story-ending {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ending-content {
  background: linear-gradient(135deg, #1a237e, #3949ab);
  border: 2px solid #7986cb;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.ending-content h1 {
  font-size: 2.5rem;
  margin-bottom: 24px;
  color: #ffffff;
  background: linear-gradient(135deg, #64b5f6, #90caf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ending-content p {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #e1bee7;
  margin-bottom: 16px;
}

.ending-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}
`;
