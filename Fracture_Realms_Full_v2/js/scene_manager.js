
export class SceneManager {
  constructor(){
    this.scenes = {
      menu: document.getElementById('menu'),
      options: document.getElementById('options'),
      credits: document.getElementById('credits'),
      worldmap: document.getElementById('worldmap'),
      hud: document.getElementById('hud')
    };
    this.show('menu');
  }
  show(name){
    for(const k in this.scenes){
      this.scenes[k].classList.toggle('hidden', k!==name);
      this.scenes[k].classList.toggle('active', k===name);
    }
  }
  toast(msg, ms=1800){
    const t=document.getElementById('toast');
    t.textContent=msg; t.style.display='block';
    clearTimeout(this._toastTimer);
    this._toastTimer=setTimeout(()=> t.style.display='none', ms);
  }
}
