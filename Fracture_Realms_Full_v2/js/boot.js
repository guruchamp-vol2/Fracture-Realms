
import { SceneManager } from './scene_manager.js';
import { Campaign } from './campaign.js';
import { Game } from './game.js';

export class Boot {
  constructor(){
    this.sm = new SceneManager();
    this.campaign = new Campaign(this.sm);
    this.game = null;

    // Menu wire-up
    const $ = (id)=>document.getElementById(id);
    $('#btnPlay').onclick = ()=> this.toWorldMap();
    $('#btnArcade').onclick = ()=> this.startGame({mode:'endless'});
    $('#btnOptions').onclick = ()=> this.sm.show('options');
    $('#btnCredits').onclick = ()=> this.sm.show('credits');
    $('#btnOptBack').onclick = ()=> this.sm.show('menu');
    $('#btnCredsBack').onclick = ()=> this.sm.show('menu');

    // Map buttons
    $('#btnMapBack').onclick = ()=> this.sm.show('menu');
    $('#btnEnterRealm').onclick = ()=> this.enterSelectedWorld();

    // HUD buttons wired in Game constructor when active
  }

  toWorldMap(){
    this.campaign.renderWorldMap();
    this.sm.show('worldmap');
  }

  enterSelectedWorld(){
    const world = this.campaign.getSelectedWorld();
    if(!world) return;
    this.startGame({mode:'campaign', world});
  }

  startGame(opts){
    this.sm.show('hud');
    const canvas=document.getElementById('game');
    this.game = new Game(canvas, opts, this.campaign, this.sm);
  }
}
