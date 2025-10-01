import { SceneManager } from './scene_manager.js';
import { Campaign } from './campaign.js';
import { Game } from './game.js';

class Boot {
  constructor(){
    this.sm = new SceneManager();
    this.campaign = new Campaign(this.sm);
    this.game = null;

    const $ = (id)=>document.getElementById(id);
    // Safeguard: attach only if elements exist
    $('#btnPlay')?.addEventListener('click', () => this.toWorldMap());
    $('#btnArcade')?.addEventListener('click', () => this.startGame({mode:'endless'}));
    $('#btnOptions')?.addEventListener('click', () => this.sm.show('options'));
    $('#btnCredits')?.addEventListener('click', () => this.sm.show('credits'));
    $('#btnOptBack')?.addEventListener('click', () => this.sm.show('menu'));
    $('#btnCredsBack')?.addEventListener('click', () => this.sm.show('menu'));
    $('#btnMapBack')?.addEventListener('click', () => this.sm.show('menu'));
    $('#btnEnterRealm')?.addEventListener('click', () => this.enterSelectedWorld());
  }

  toWorldMap(){
    this.campaign.renderWorldMap();
    this.sm.show('worldmap');
  }
  enterSelectedWorld(){
    const world=this.campaign.getSelectedWorld();
    if(world) this.startGame({mode:'campaign',world});
  }
  startGame(opts){
    this.sm.show('hud');
    const canvas=document.getElementById('game');
    this.game = new Game(canvas, opts, this.campaign, this.sm);
  }
}

// Auto-start once DOM is ready, so buttons are definitely present
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => { window._boot = new Boot(); });
} else {
  window._boot = new Boot();
}
export { Boot };
