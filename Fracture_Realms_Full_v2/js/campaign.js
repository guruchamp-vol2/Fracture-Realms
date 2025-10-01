
const SAVE_KEY='fracture.full.save.v2';

export class Campaign {
  constructor(sceneManager){
    this.sm=sceneManager;
    this.state = this.load() || { unlocked: 1, shards: 0, owned: [] };
    this.worlds = [];
    this.selected = 0;
    fetch('./data/levels.json').then(r=>r.json()).then(d=>{
      this.worlds = d.worlds;
      this.renderWorldMap();
    });
  }
  save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); }catch{} }
  load(){ try{ return JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); }catch{ return null; } }
  addShards(n){ this.state.shards = (this.state.shards||0)+n; this.save(); }
  unlockNext(){ this.state.unlocked = Math.min(this.worlds.length, (this.state.unlocked||1)+1); this.save(); }

  renderWorldMap(){
    const grid=document.getElementById('mapGrid');
    if(!grid) return;
    grid.innerHTML='';
    this.worlds.forEach((w,i)=>{
      const locked = i>=(this.state.unlocked||1);
      const node=document.createElement('div');
      node.className='map-node'+(locked?' locked':'');
      node.innerHTML = `<div><b>${i+1}. ${w.name}</b></div><div class="muted small">${w.realm} • ${w.boss}</div>`;
      if(!locked){
        node.onclick = ()=>{ this.selected=i; this.sm.toast(`Selected: ${w.name}`); };
      }
      grid.appendChild(node);
    });
  }

  getSelectedWorld(){ return this.worlds[this.selected]; }
}
