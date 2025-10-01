
export class SceneManager {
  constructor(){
    this.scenes = {
      menu: document.getElementById('menu'),
      options: document.getElementById('options'),
      credits: document.getElementById('credits'),
      worldmap: document.getElementById('worldmap'),
      hud: document.getElementById('hud')
    };
    // Remove null entries
    for (const k in this.scenes) {
      if (!this.scenes[k]) {
        delete this.scenes[k];
      }
    }
    this.show('menu');
  }
  show(name){
    for(const k in this.scenes){
      const scene = this.scenes[k];
      if (scene) {
        scene.classList.toggle('hidden', k!==name);
        scene.classList.toggle('active', k===name);
      }
    }
  }
  toast(msg, ms=1800){
    const t=document.getElementById('toast');
    if (!t) return;
    t.textContent=msg; 
    t.style.display='block';
    clearTimeout(this._toastTimer);
    this._toastTimer=setTimeout(()=> t.style.display='none', ms);
  }
}
