
export class AudioBus {
  constructor(){
    const AC = window.AudioContext||window.webkitAudioContext;
    this.ctx = AC? new AC() : null;
    this.muted = false;
    this._resume = ()=> this.ctx && this.ctx.resume();
    window.addEventListener('pointerdown', this._resume, {once:true});
  }
  env(freq=440, type='sine', tA=0.002, tD=0.2, gain=0.08){
    if(!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value=freq;
    g.gain.value=0; g.gain.setValueAtTime(0,t0);
    g.gain.linearRampToValueAtTime(gain, t0+tA);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+tA+tD);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0); o.stop(t0+tA+tD+0.05);
  }
  pew(){ this.env(720,'triangle',0.005,0.2,0.06); }
  hit(){ this.env(180,'square',0.001,0.12,0.09); }
  dash(){ this.env(140,'sawtooth',0.001,0.08,0.06); }
  jump(){ this.env(500,'sine',0.002,0.1,0.05); }
  pop(){ this.env(900,'triangle',0.001,0.08,0.05); }
  flip(){ this.env(240,'sine',0.002,0.5,0.07); }
  victory(){ this.env(660,'square',0.002,0.5,0.1); setTimeout(()=>this.env(990,'square',0.002,0.6,0.08), 120); }
}
