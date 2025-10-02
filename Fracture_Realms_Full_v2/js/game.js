// Fracture_Realms_Full_v2/js/game.js

import { AudioBus } from './sound.js';
import { makeBosses } from './modules/bosses.js';
import { makeRealms } from './modules/realms.js';
import { Input } from './modules/input.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a=1,b=0)=>Math.random()*(b-a)+a;
const now=()=>performance.now();

class Rect { constructor(x,y,w,h){ this.x=x; this.y=y; this.w=w; this.h=h; } }
class Platform extends Rect {
  constructor(x,y,w,h,assist=false){
    super(x,y,w,h);
    this.stand=0;
    this.breakAt=(assist?4200:2400)+Math.random()*1500;
    this.dead=false;
    this.vx=0;
    this.phase=Math.random()*Math.PI*2;
    this.type=Math.random()<0.25?'moving':'static';
  }
  update(dt,t){
    if(this.dead) return;
    if(this.standing){
      this.stand+=dt*1000;
      if(this.stand>this.breakAt) this.dead=true;
    } else {
      this.stand=Math.max(0,this.stand-dt*500);
    }
    this.standing=false;

    if(this.type==='moving'){
      this.vx=Math.sin(t*0.5+this.phase)*20;
      this.x+=this.vx*dt;
    }
  }
  draw(ctx){
    if(this.dead) return;
    const k=clamp(this.stand/this.breakAt,0,1);
    // Brighter, more visible platforms
    ctx.fillStyle=`hsl(${lerp(200,10,k)},70%,${lerp(70,50,k)}%)`;
    ctx.fillRect(this.x,this.y,this.w,this.h);
    ctx.strokeStyle=`hsl(${lerp(210,0,k)},90%,${lerp(60,75,k)}%)`;
    ctx.lineWidth=3;
    ctx.beginPath();
    for(let i=0;i<3;i++){
      const px=this.x+this.w*(i+1)/4;
      ctx.moveTo(px,this.y);
      ctx.lineTo(px+Math.sin(k*10+i)*8,this.y+this.h);
    }
    ctx.stroke();
  }
}
class Player {
  constructor(id, x, y, input){
    this.id=id; this.pos={x,y}; this.vel={x:0,y:0};
    this.w=48; this.h=64;
    this.onGround=false; this.jumps=2; this.facing=1;
    this.dashCD=0; this.dashCharges=1; this.maxDash=1;
    this.hp=100; this.iframes=0;
    this.combo=0; this.comboTimer=0;
    this.grapple=null; this.lastAttack='';
    this.style='sword'; this.input=input;
    this.alive=true; this.tint=id===1?'#90caf9':'#a5d6a7';
  }
  rect(){ return new Rect(this.pos.x-this.w/2, this.pos.y-this.h/2, this.w, this.h); }
}
class Enemy {
  constructor(x,y,t='grunt'){
    this.pos={x,y}; this.vel={x:0,y:0};
    this.w=36; this.h=44;
    this.hp=t==='brute'?70:40;
    this.onGround=false;
    this.blockMelee=0; this.blockMagic=0; this.cool=0;
    this.type=t;
  }
  rect(){ return new Rect(this.pos.x-this.w/2,this.pos.y-this.h/2,this.w,this.h); }
}

export class Game {
  constructor(canvas, opts, campaign, sm){
    this.cvs=canvas; this.ctx=canvas.getContext('2d');
    this.W=innerWidth; this.H=innerHeight;
    const resize=()=>{ this.W=innerWidth; this.H=innerHeight; this.cvs.width=this.W; this.cvs.height=this.H; };
    addEventListener('resize', resize); resize();

    // --- UI refs ---
    const $=(id)=>document.getElementById(id);
    this.ui={
      log:$('#log'),
      chipRealm:$('#chipRealm'), chipGrav:$('#chipGrav'), chipWarp:$('#chipWarp'),
      chipCombo:$('#chipCombo'), chipShards:$('#chipShards'), chipBoss:$('#chipBoss'),
      panelUp:$('#upgradePanel'), listUp:$('#upgradeList'),
      pause:$('#pauseMenu'),
      btnPause:$('#btnPause'), btnResume:$('#btnResume'),
      btnRestart:$('#btnRestartRealm'), btnNext:$('#btnNextRealm'),
      btnReturnToMenu:$('#btnReturnToMenu'),
      chkShake:$('#chkScreenShake'), chkParticles:$('#chkParticles'), chkAssist:$('#chkAssist')
    };

    // Robust hide helper
    const hideEl=(el,hide)=>{
      if(!el) return;
      el.classList.toggle('hidden', hide);
      el.style.display = hide ? 'none' : '';
      el.setAttribute('aria-hidden', hide ? 'true' : 'false');
    };
    this._hideEl = hideEl;

    // Buttons with proper event handling
    if (this.ui.btnPause) {
      console.log('✓ Pause button found');
      // Clone to remove any existing listeners
      const newPauseBtn = this.ui.btnPause.cloneNode(true);
      this.ui.btnPause.parentNode.replaceChild(newPauseBtn, this.ui.btnPause);
      this.ui.btnPause = newPauseBtn;
      
      this.ui.btnPause.addEventListener('click', () => {
        console.log('⏸ Pause clicked');
        this.togglePause();
      });
    } else {
      console.error('❌ Pause button NOT found');
    }
    if (this.ui.btnResume) {
      this.ui.btnResume.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePause(false);
      });
    }
    if (this.ui.btnRestart) {
      this.ui.btnRestart.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.restartRealm();
      });
    }
    if (this.ui.btnNext) {
      this.ui.btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextRealm();
      });
    }
    if (this.ui.btnReturnToMenu) {
      this.ui.btnReturnToMenu.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.returnToMenu();
      });
    }
    if (this.ui.chkShake) {
      this.ui.chkShake.addEventListener('change', (e) => {
        this.screenShake = e.target.checked;
      });
    }
    if (this.ui.chkParticles) {
      this.ui.chkParticles.addEventListener('change', (e) => {
        this.particlesOn = e.target.checked;
      });
    }
    if (this.ui.chkAssist) {
      this.ui.chkAssist.addEventListener('change', (e) => {
        this.assist = e.target.checked;
        this.restartRealm();
      });
    }

    // Fallback "Open Upgrades"/"Close"
    document.addEventListener('click', (e)=>{
      const t=e.target;
      const txt=(t.textContent||'').toLowerCase().trim();
      if(txt.startsWith('open upgrades')) this.toggleUp(true);
      if(this.ui.panelUp && this.ui.panelUp.contains(t) && txt.startsWith('close')) this.toggleUp(false);
    });

    // Systems
    this.audio = new AudioBus();
    this.input = new Input();

    // Options/runtime
    this.screenShake=true; this.particlesOn=true; this.assist=false;
    this.timeScale=1; this.gravDir=1;
    this.MOD={ gravity:1000, gravFlipEvery:30000, timePulseEvery:12000, timePulseMin:.7, timePulseMax:1.3, hazardRiseSpeed:12 };
    this.nextGravFlip=now()+this.MOD.gravFlipEvery; this.nextTimePulse=now()+this.MOD.timePulseEvery; this.pulsing=false;

    // Player movement tuning (balanced speed)
    this.PHYS = {
      moveAccel: 1800,
      maxSpeed: 280,
      airControl: 0.75,
      groundFriction: 1400,
      airFriction: 500,
      jumpVel: 450
    };

    // No time pulse right after spawn/boss
    this.disablePulseUntil = now() + 4000;

    // State
    this.platforms=[]; this.enemies=[]; this.bullets=[]; this.effects=[]; this.shards=[];
    this.players=[ new Player(1,this.W*0.5,this.H*0.2, ()=>this.input.p1() ), new Player(2,this.W*0.5+40,this.H*0.2, ()=>this.input.p2() ) ];
    this.players[1].enabled=false;
    this.lavaY=this.H+120; this.boss=null; this.realm=null; this.realmIndex=0;
    this.shardCount = (campaign?.state?.shards)||0;
    this.campaign = campaign; this.sm=sm;

    // Modules
    this.bosses = makeBosses(this);
    this.realms = makeRealms(this);

    // Mode/world mods
    this.mode = opts?.mode||'campaign';
    this.world = opts?.world||null;
    if(this.world?.modifiers){
      this.MOD.gravFlipEvery = (this.world.modifiers.gravFlip||20)*1000;
      this.MOD.timePulseEvery = (this.world.modifiers.timePulse||8)*1000;
    }

    // Start unpaused, hide overlays
    this.paused=false;
    if (this.ui.pause) this.ui.pause.style.display = 'none';
    if (this.ui.panelUp) this.ui.panelUp.style.display = 'none';

    // Init & loop
    this.addArena(); this.spawnWave(4);
    setTimeout(()=> this.spawnBoss(), 4000);
    this.log(`Entering ${this.realms.active?.name||'Realm'}.`);
    this.lt=now();
    const loop=()=>{
      let t=now(); let dt=(t-this.lt)/1000; this.lt=t;
      if(dt>0.05) dt=0.05;
      if(!this.paused){ this.update(dt); }
      this.draw();
      requestAnimationFrame(loop);
    };
    loop();
  }

  // --- UI helpers ---
  toggleUp(force){
    const show = force===undefined ? (this.ui.panelUp?.style.display==='none') : force;
    if (this.ui.panelUp) {
      this.ui.panelUp.style.display = show ? 'block' : 'none';
    }
    if(show) this.renderUpgradePanel();
  }
  togglePause(force){
    const show = force===undefined ? !this.paused : force;
    this.paused = show;
    
    // Direct style manipulation for reliability
    if (this.ui.pause) {
      this.ui.pause.style.display = show ? 'grid' : 'none';
      console.log(show ? '⏸ Game paused' : '▶ Game resumed');
    }
  }
  log(msg, cls=''){
    if(!this.ui.log) return;
    const div=document.createElement('div');
    div.textContent=`${new Date().toLocaleTimeString()} — ${msg}`;
    if(cls) div.classList.add(cls);
    this.ui.log.prepend(div);
    while(this.ui.log.childElementCount>16) this.ui.log.lastChild?.remove();
  }

  renderUpgradePanel(){
    const list=this.ui.listUp; if(!list) return;
    list.innerHTML='';
    const U=[
      {id:'tripleDash', cost:15, desc:'+1 Dash charge.'},
      {id:'ultraDash', cost:25, desc:'+1 Dash charge (total +2).'},
      {id:'ricochet', cost:18, desc:'Magic ricochets once.'},
      {id:'aerialCombo', cost:20, desc:'+30% airborne melee damage.'},
      {id:'grappleBoost', cost:16, desc:'Grapple pulls 30% harder.'},
      {id:'styleSwitch', cost:12, desc:'Unlock style switch (1..3).'}
    ];
    const buy=(u)=>{
      if(this.owned?.has(u.id)) return;
      if(this.shardCount<u.cost){ this.log('Not enough shards.','warn'); return;}
      this.shardCount-=u.cost;
      this.owned=this.owned||new Set();
      this.owned.add(u.id);
      if(u.id==='tripleDash'||u.id==='ultraDash'){
        this.players[0].maxDash=1 + (this.owned.has('tripleDash')?1:0) + (this.owned.has('ultraDash')?1:0);
        this.players[0].dashCharges=this.players[0].maxDash;
      }
      if(u.id==='ricochet'){ this.players.forEach(p=>p.ricochet=true);}
      if(u.id==='aerialCombo'){ this.players.forEach(p=>p.airDmg=1.3);}
      if(u.id==='grappleBoost'){ this.players.forEach(p=>p.grappleBoost=true);}
      if(u.id==='styleSwitch'){ this.players.forEach(p=>p.canSwitch=true);}
      this.campaign?.addShards?.(0);
      list.querySelectorAll('.buy').forEach(b=>b.disabled=false);
      this.renderUpgradePanel();
      this.log('Upgrade: '+u.id,'ok');
      this.audio.pop();
    };
    for(const u of U){
      const el=document.createElement('div');
      el.className='upg';
      const owned=this.owned?.has?.(u.id);
      el.innerHTML=`<div>${owned?'Purchased: ':''}${u.desc}</div>
        <div class="row"><div class="muted">${u.cost} shards</div>
        <button class="btn buy" ${owned?'disabled':''}>Buy</button></div>`;
      el.querySelector('.buy').onclick=()=>buy(u);
      list.appendChild(el);
    }
  }

  // --- World gen ---
  addArena(){
    this.platforms.length=0;
    const floorY=this.H*0.75;
    for(let i=0;i<10;i++){
      const w=rand(140,260), x=rand(40,this.W-40-w), y=floorY - i*rand(68, 95);
      this.platforms.push(new Platform(x,y,w,18,this.assist));
    }
    this.platforms.push(new Platform(40, floorY+80, this.W-80, 22, this.assist));
    this.lavaY=this.H+160;
  }
  spawnWave(n=3){
    for(let i=0;i<n;i++){
      const t = Math.random()<0.25?'brute':'grunt';
      this.enemies.push(new Enemy(rand(80,this.W-80), rand(60, this.H*0.4), t));
    }
  }
  spawnBoss(){
    if(this.boss) return;
    const b = this.bosses.pick(this.world?.boss);
    const p = this.players[0];
    // Place boss away from player
    let tries=0;
    while(tries++<40){
      b.pos.x = rand(120, this.W-120);
      b.pos.y = rand(80, this.H*0.45);
      const farEnough = Math.abs(b.pos.x - p.pos.x) > 220;
      if(farEnough && !this.rectsOverlap(b.rect(), p.rect())) break;
    }
    this.disablePulseUntil = now() + 3000;
    this.boss = b;
    this.log(`${b.name} enters the realm!`);
  }

  // --- Collision ---
  rectsOverlap(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
  collideWithPlatforms(ent,dt){
    ent.onGround=false;
    let r=ent.rect();
    ent.pos.x+=ent.vel.x*dt;
    r=ent.rect();
    for(const p of this.platforms){
      if(p.dead) continue;
      const pr=new Rect(p.x,p.y,p.w,p.h);
      if(this.rectsOverlap(r,pr)){
        if(ent.vel.x>0) ent.pos.x=pr.x - ent.w/2;
        else ent.pos.x=pr.x+pr.w + ent.w/2;
        ent.vel.x=0;
      }
    }
    ent.pos.y+=ent.vel.y*dt;
    r=ent.rect();
    for(const p of this.platforms){
      if(p.dead) continue;
      const pr=new Rect(p.x,p.y,p.w,p.h);
      if(this.rectsOverlap(r,pr)){
        if(ent.vel.y*this.gravDir>0){
          ent.pos.y = this.gravDir>0 ? pr.y - ent.h/2 : pr.y+pr.h + ent.h/2;
          ent.vel.y=0; ent.onGround=true;
          if(ent===this.players[0]||ent===this.players[1]) p.standing=true;
        } else {
          ent.pos.y = this.gravDir>0 ? pr.y+pr.h + ent.h/2 : pr.y - ent.h/2;
          ent.vel.y=0;
        }
      }
    }
    ent.pos.x = Math.max(20, Math.min(this.W-20, ent.pos.x));
    if(ent.pos.y>this.H+300 || ent.pos.y<-300){
      if(ent instanceof Player){
        ent.hp-=25; ent.pos={x:this.W/2,y:100}; ent.vel={x:0,y:0};
        this.log('Lost to the void! -25 HP','warn'); this.shake(10,200);
      } else { ent.hp=0; this.spawnShards(ent.pos.x, ent.pos.y, 4); }
    }
  }

  // --- Combat ---
  meleeHitbox(p){ const reach=48; const r=p.rect(); return new Rect(p.facing>0? r.x+r.w : r.x-reach, r.y+10, reach, r.h-20); }
  doMelee(p){
    p.lastAttack='melee';
    const hb=this.meleeHitbox(p);
    for(const e of this.enemies){
      if(e.hp<=0) continue;
      if(this.rectsOverlap(hb,e.rect())){
        const block=e.blockMelee>0?0.25:1;
        e.hp -= (e.type==='brute'?12:16)*block;
        this.fxSlash(e.pos.x,e.pos.y);
        if(block<1) this.log('Enemy blocked your melee!');
        this.audio.hit();
      }
    }
    if(this.boss){
      const b=this.boss;
      if(this.rectsOverlap(hb,b.rect())){
        const airborne=!p.onGround; const mult=p.airDmg||1;
        const dmg=airborne? Math.round(14*mult):0;
        if(dmg>0){
          b.hp-=dmg; this.fxSlash(b.pos.x,b.pos.y,true);
          if(!b.enraged && b.hp<b.maxHP*0.5){
            b.enraged=true; this.log('Boss enraged! Hazards intensify.','danger');
          }
          this.audio.hit();
        } else { this.fxBlock(b.pos.x,b.pos.y); }
      }
    }
    p.combo=Math.min(999,p.combo+1); p.comboTimer=2.5;
  }
  shootMagic(p){
    p.lastAttack='magic';
    const speed=540; const spread=0.06; const dir=p.facing; const angle=dir>0?0:Math.PI;
    this.bullets.push({
      x:p.pos.x,y:p.pos.y-10,
      vx:Math.cos(angle+rand(-spread,spread))*speed,
      vy:Math.sin(angle+rand(-spread,spread))*speed,
      life:1.2,dmg:10,from:p.id
    });
    p.combo=Math.min(999,p.combo+1); p.comboTimer=2.0; this.audio.pew();
  }
  dash(p){
    if(p.dashCD<=0 && p.dashCharges>0){
      const power=600; p.vel.x += power*p.facing;
      p.dashCD=0.8; p.dashCharges--;
      this.fxTrail(p.pos.x,p.pos.y); this.shake(6,120); this.audio.dash();
    }
  }

  // --- FX & Util ---
  fxSlash(x,y,big=false){ this.effects.push({type:'slash',x,y,t:0,max:0.25,big}); }
  fxBlock(x,y){ this.effects.push({type:'block',x,y,t:0,max:0.3}); }
  fxTrail(x,y){ this.effects.push({type:'trail',x,y,t:0,max:0.35}); }
  fxBossLand(x,y){ this.effects.push({type:'shock',x,y,t:0,max:0.8}); }
  shake(intensity=6,ms=150){
    if(!this.screenShake) return;
    const t0=now(); const end=t0+ms;
    const step=()=>{
      const t=now();
      if(t>end){ this.cameraShake={x:0,y:0}; return;}
      const k=(end-t)/ms;
      this.cameraShake={x:(Math.random()*2-1)*intensity*k, y:(Math.random()*2-1)*intensity*k};
      requestAnimationFrame(step);
    };
    step();
  }
  spawnShards(x,y,amt=Math.floor(rand(3,7))){
    for(let i=0;i<amt;i++){ this.shards.push({x,y,vx:rand(-120,120),vy:rand(-220,-80),g:700,life:8}); }
  }

  // --- Pretty drawing helpers ---
  drawPlayer(ctx, p, time){
    ctx.save(); ctx.translate(p.pos.x,p.pos.y);
    const bob = Math.sin(time*3 + p.id)*2;

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, p.h/2 + 8, p.w*0.55, 6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Capsule body
    const grad = ctx.createLinearGradient(0, -p.h/2, 0, p.h/2);
    grad.addColorStop(0, '#eaf2ff'); grad.addColorStop(1, '#cfe3ff');
    ctx.fillStyle = grad; ctx.strokeStyle = p.tint; ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-p.w/2, -p.h/2 + bob, p.w, p.h, 10);
    else {
      let x=-p.w/2, y=-p.h/2 + bob, w=p.w, h=p.h, r=10;
      ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
      ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r);
      ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    }
    ctx.fill(); ctx.stroke();

    // Eyes (blink)
    const blink = (Math.floor(time*2+p.id)%8===0)?0.15:1;
    ctx.fillStyle = '#17263a';
    ctx.fillRect(-8, -8 + bob, 6, 6*blink);
    ctx.fillRect( 2, -8 + bob, 6, 6*blink);

    // Style aura
    let ringCol = null;
    if (p.style==='magic') ringCol = 'rgba(128,222,234,0.55)';
    else if (p.style==='gun') ringCol = 'rgba(239,154,154,0.5)';
    if (ringCol) {
      ctx.strokeStyle = ringCol; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, bob, 26 + Math.min(p.combo,15)*0.3, 0, Math.PI*2);
      ctx.stroke();
    }

    // Speed lines
    if (Math.abs(p.vel.x)>260) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#bbdefb';
      for(let i=1;i<=3;i++){
        ctx.fillRect(-p.w/2 - i*8, -p.h/3 + bob, 12, 4);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // High-detail goblin-style boss (original design)
  drawBoss(ctx, b, time){
    ctx.save(); ctx.translate(b.pos.x,b.pos.y);

    // Shadow
    ctx.save(); ctx.globalAlpha=0.18;
    ctx.fillStyle='#000'; ctx.beginPath();
    ctx.ellipse(0,b.h/2+10,b.w*0.55,8,0,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // Torso (leather armor)
    const torsoGrad = ctx.createLinearGradient(0,-b.h*0.1,0,b.h*0.5);
    torsoGrad.addColorStop(0,'#5a3e28'); torsoGrad.addColorStop(1,'#7a5338');
    ctx.fillStyle=torsoGrad; ctx.strokeStyle=b.enraged?'#ff8f50':'#caa27a';
    ctx.lineWidth=3; ctx.shadowColor=b.enraged?'rgba(255,96,0,0.5)':'rgba(0,0,0,0.25)'; ctx.shadowBlur=b.enraged?20:10;

    const torsoW=b.w*0.9, torsoH=b.h*0.6;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(-torsoW/2, -torsoH/2+10, torsoW, torsoH, 12);
    else {
      let x=-torsoW/2, y=-torsoH/2+10, w=torsoW, h=torsoH, r=12;
      ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
      ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r);
      ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    }
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0;

    // Head (green skin)
    ctx.save();
    ctx.translate(0,-torsoH/2-16);
    const headGrad=ctx.createLinearGradient(0,-28,0,28);
    headGrad.addColorStop(0,b.enraged?'#8de139':'#9be65a');
    headGrad.addColorStop(1,b.enraged?'#5fb728':'#6ec534');
    ctx.fillStyle=headGrad; ctx.strokeStyle=b.enraged?'#ffb74d':'#c5e1a5'; ctx.lineWidth=3;

    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(-36,-28,72,56,14);
    else {
      let x=-36,y=-28,w=72,h=56,r=14;
      ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
      ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r);
      ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    }
    ctx.fill(); ctx.stroke();

    // Ears
    ctx.fillStyle=b.enraged?'#7bcf2f':'#85d93f';
    ctx.beginPath(); ctx.moveTo(-36, -6); ctx.quadraticCurveTo(-56,-10,-60,6); ctx.quadraticCurveTo(-44,4,-36,2); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 36, -6); ctx.quadraticCurveTo( 56,-10, 60,6); ctx.quadraticCurveTo( 44,4, 36,2); ctx.fill();

    // Eyes glow
    ctx.fillStyle=b.enraged?'#ffd54f':'#fff176';
    const blink = (Math.floor(time*2)%10===0)?0.15:1;
    ctx.fillRect(-14,-6,10,10*blink);
    ctx.fillRect(  4,-6,10,10*blink);
    ctx.fillStyle='rgba(255,249,196,0.45)';
    ctx.beginPath(); ctx.arc(-9,-1,8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( 9,-1,8,0,Math.PI*2); ctx.fill();

    // Tusks
    ctx.fillStyle='#f5f5f5';
    ctx.beginPath(); ctx.moveTo(-8,12); ctx.lineTo(-2,18); ctx.lineTo(-6,8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 8,12); ctx.lineTo( 2,18); ctx.lineTo( 6,8); ctx.closePath(); ctx.fill();

    // Mouth line
    ctx.strokeStyle='#2f3b12'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(-10,10); ctx.quadraticCurveTo(0,14,10,10); ctx.stroke();

    ctx.restore();

    // Shoulder pads
    ctx.fillStyle='#8d6e63';
    ctx.beginPath(); ctx.ellipse(-torsoW*0.35,-torsoH*0.15,18,12,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( torsoW*0.35,-torsoH*0.15,18,12,0,0,Math.PI*2); ctx.fill();

    // Belt + loincloth
    ctx.fillStyle='#3e2723'; ctx.fillRect(-torsoW/2, 6, torsoW, 10);
    ctx.fillStyle='#6d4c41';
    ctx.beginPath(); ctx.moveTo(0,16); ctx.lineTo(-12,46); ctx.lineTo(12,46); ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  // --- Update ---
  update(dt){
    if(now()>this.nextGravFlip){
      this.gravDir*=-1; this.nextGravFlip=now()+this.MOD.gravFlipEvery;
      this.log(`Gravity flipped ${this.gravDir>0?'DOWN':'UP'}!`,'warn'); this.audio.flip();
    }
    if(now()>this.nextTimePulse && now()>this.disablePulseUntil){
      this.pulsing=true; this.nextTimePulse=now()+this.MOD.timePulseEvery;
      const target=rand(this.MOD.timePulseMin,this.MOD.timePulseMax); this.pulseTo(target);
    }
    const t=performance.now()/1000; const dt2=dt*this.timeScale;

    // UI chips
    this.ui.chipGrav && (this.ui.chipGrav.textContent=`Gravity: ${this.gravDir>0?'↓':'↑'}`);
    this.ui.chipWarp && (this.ui.chipWarp.textContent=`Time Warp: ${this.timeScale.toFixed(2)}×`);
    this.ui.chipCombo && (this.ui.chipCombo.textContent=`Combo: ${this.players[0].combo|0}`);
    this.ui.chipShards && (this.ui.chipShards.textContent=`Shards: ${this.shardCount|0}`);
    this.ui.chipBoss && (this.ui.chipBoss.textContent=this.boss? `${this.boss.name} ${Math.max(0,this.boss.hp)|0}/${this.boss.maxHP}`:'Boss: —');
    this.ui.chipRealm && (this.ui.chipRealm.textContent=`Realm: ${this.realms.active?.name||'Realm'}`);

    // hazards
    const lavaDir=this.gravDir>0?-1:1;
    this.lavaY += lavaDir * (this.MOD.hazardRiseSpeed*(this.boss?.enraged?1.6:1)) * dt2;

    // platforms
    for(const p of this.platforms) p.update(dt2,t);

    // players — faster movement model
    const p0=this.players[0];
    this.input.pollGamepad();
    for(const p of this.players){
      if(p.id===2 && !p.enabled) continue;
      if(!p.alive) continue;

      p.dashCD=Math.max(0,p.dashCD-dt2);
      if(p.onGround){ p.jumps=2; p.dashCharges=p.maxDash; }

      const inp=p.input();

      // Horizontal accel / friction
      const accel = this.PHYS.moveAccel * (p.onGround ? 1 : this.PHYS.airControl);
      p.vel.x += (inp.ax||0) * accel * dt2;

      if(Math.abs(inp.ax) < 0.001){
        const fr = (p.onGround ? this.PHYS.groundFriction : this.PHYS.airFriction) * dt2;
        if(p.vel.x > 0) p.vel.x = Math.max(0, p.vel.x - fr);
        else if(p.vel.x < 0) p.vel.x = Math.min(0, p.vel.x + fr);
      }

      p.vel.x = clamp(p.vel.x, -this.PHYS.maxSpeed, this.PHYS.maxSpeed);

      // Gravity
      p.vel.y += this.MOD.gravity*this.gravDir*dt2;

      // Facing
      if(Math.abs(p.vel.x)>6) p.facing=Math.sign(p.vel.x);

      // Style switch
      if(p.canSwitch){ if(inp.style1) p.style='sword'; if(inp.style2) p.style='magic'; if(inp.style3) p.style='gun'; }

      // Jump
      if(inp.jump && (p.onGround || p.jumps>0)){
        p.vel.y -= this.PHYS.jumpVel*this.gravDir; p.jumps--; this.audio.jump();
      }

      // Attacks / dash / grapple
      if(inp.melee) this.doMelee(p);
      if(inp.magic) this.shootMagic(p);
      if(inp.dash) this.dash(p);
      if(inp.grapple){ p.grapple={x:this.input.mouse.x,y:this.input.mouse.y,active:true}; }
      if(p.grapple?.active){
        const dx=p.grapple.x-p.pos.x,dy=p.grapple.y-p.pos.y;
        const dist=Math.hypot(dx,dy)+1e-3; const pull=(p.grappleBoost?16:12);
        p.vel.x+=(dx/dist)*pull; p.vel.y+=(dy/dist)*pull;
        if(dist<30) p.grapple.active=false;
      }

      this.collideWithPlatforms(p,dt2);
      if(p.hp<=0){ p.alive=false; this.log(`Player ${p.id} fell.`,'danger'); }
    }

    // bullets
    for(const b of this.bullets){ b.x+=b.vx*dt2; b.y+=b.vy*dt2; b.vy+=this.MOD.gravity*0.12*this.gravDir*dt2; b.life-=dt2; }
    if(p0.ricochet){
      for(const b of this.bullets){
        if(b.life<0.7 && !b.ric){
          if(b.x<0||b.x>this.W){ b.vx*=-1; b.ric=true; }
          if(b.y<0||b.y>this.H){ b.vy*=-1; b.ric=true; }
        }
      }
    }

    // hits
    for(const b of this.bullets){
      if(b.life<=0) continue;
      for(const e of this.enemies){
        if(e.hp>0 && this.rectsOverlap(new Rect(b.x-6,b.y-6,12,12), e.rect())){
          const block=e.blockMagic>0?0.25:1;
          e.hp -= b.dmg*block; b.life=0;
          if(block<1) this.log('Enemy resisted your magic!');
          this.spawnShards(e.pos.x,e.pos.y,2); this.audio.hit();
        }
      }
      if(this.boss && b.life>0 && this.rectsOverlap(new Rect(b.x-6,b.y-6,12,12), this.boss.rect())){
        const p = this.players.find(pp=>pp.id===b.from);
        const dmg = (!p?.onGround)? 8 : 0;
        if(dmg>0){ this.boss.hp-=dmg; }
        b.life=0;
      }
    }

    // enemies
    for(const e of this.enemies){
      if(e.hp<=0) continue; e.cool=Math.max(0,e.cool-dt2);
      if(p0.combo>4){ if(p0.lastAttack==='melee') e.blockMelee=1.5; if(p0.lastAttack==='magic') e.blockMagic=1.5; }
      e.blockMelee=Math.max(0,e.blockMelee-dt2); e.blockMagic=Math.max(0,e.blockMagic-dt2);
      const target=p0; const dir=Math.sign(target.pos.x-e.pos.x);
      const speed = e.type==='brute'?160:200;
      e.vel.x = lerp(e.vel.x, dir*speed, 0.08);
      e.vel.y += this.MOD.gravity*0.9*this.gravDir*dt2;
      if(e.onGround && Math.random()<0.01) e.vel.y -= 420*this.gravDir;
      this.collideWithPlatforms(e,dt2);
      if(this.rectsOverlap(p0.rect(), e.rect()) && p0.iframes<=0){
        p0.hp-= (e.type==='brute'?12:8); p0.iframes=0.6;
        p0.vel.x += (p0.pos.x<e.pos.x?-1:1)*-220; this.log('Ouch!'); this.shake();
      }
    }

    // boss
    if(this.boss){
      this.boss.update(dt2);
      if(this.boss.hp<=0){
        this.log(`${this.boss.name} defeated! Realm stabilizing...`,'ok');
        this.spawnShards(this.boss.pos.x,this.boss.pos.y,20);
        this.audio.victory(); this.boss=null;
        if(this.mode==='campaign'){ this.campaign?.unlockNext?.(); this.sm?.toast?.('World cleared! Next world unlocked.'); }
      }
    }

    // effects & shards cleanup
    for(const fx of this.effects) fx.t+=dt2;
    for(const s of this.shards){
      s.vy+=s.g*dt2*this.gravDir; s.x+=s.vx*dt2; s.y+=s.vy*dt2; s.life-=dt2;
      if(this.rectsOverlap(new Rect(s.x-8,s.y-8,16,16), this.players[0].rect())){
        s.life=0; this.shardCount++; this.campaign?.addShards?.(1); this.audio.pop();
      }
    }
    this.bullets=this.bullets.filter(b=>b.life>0);
    this.effects=this.effects.filter(f=>f.t<f.max);
    this.enemies=this.enemies.filter(e=>e.hp>0);
    this.shards=this.shards.filter(s=>s.life>0);

    if(this.enemies.length<4 && (!this.boss || this.boss.hp<this.boss.maxHP*0.5)) this.spawnWave(1);
    // Don't respawn boss automatically - only spawn once at start
    // if(!this.boss && this.shardCount>=10 && Math.random()<0.005) this.spawnBoss();

    if(this.players[0].hp<=0 && this.players[0].alive){ 
      this.players[0].alive=false;
      this.log('💀 You died! Use Restart Realm or Return to Menu.','danger'); 
      this.togglePause(true); 
    }
  }

  pulseTo(target){
    const start=this.timeScale; const dur=1200; const t0=now();
    const step=()=>{
      const t=(now()-t0)/dur; const e=t<1? (1-Math.cos(Math.PI*t))*0.5 : 1;
      this.timeScale=lerp(start,target,e);
      if(t<1) requestAnimationFrame(step); else setTimeout(()=>this.pulseBack(target),800);
    }; step();
  }
  pulseBack(from){
    const start=from; const dur=800; const t0=now();
    const step=()=>{
      const t=(now()-t0)/dur; const e=t<1? (1-Math.cos(Math.PI*t))*0.5 : 1;
      this.timeScale=lerp(start,1,e);
      if(t<1) requestAnimationFrame(step); else this.pulsing=false;
    }; step();
  }

  // --- Draw ---
  draw(){
    const ctx=this.ctx,W=this.W,H=this.H;
    ctx.clearRect(0,0,W,H);
    // Lighter, more visible background
    const g=ctx.createLinearGradient(0,0,0,H); 
    g.addColorStop(0,'#1a2332'); 
    g.addColorStop(1,'#0f1823'); 
    ctx.fillStyle=g; 
    ctx.fillRect(0,0,W,H);
    // subtle warp overlay
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, Math.abs(this.timeScale-1)*0.7);
    ctx.fillStyle='#64b5f6'; ctx.fillRect(0,0,W,H);
    ctx.restore();

    const cs=this.cameraShake||{x:0,y:0}; ctx.save(); ctx.translate(cs.x,cs.y);

    // realm layer
    this.realms.active?.draw?.(ctx, W, H, this);

    // platforms
    for(const p of this.platforms) p.draw(ctx);

    // lava
    ctx.fillStyle='#f4433655';
    if(this.gravDir>0){ ctx.fillRect(0,this.lavaY,W,H-this.lavaY); }
    else { ctx.fillRect(0,0,W,this.lavaY); }
    ctx.strokeStyle='#ff7043'; ctx.setLineDash([8,6]); ctx.beginPath(); ctx.moveTo(0,this.lavaY); ctx.lineTo(W,this.lavaY); ctx.stroke(); ctx.setLineDash([]);

    // players
    const tNow = performance.now()/1000;
    for(const p of this.players){
      if(p.id===2 && !p.enabled) continue;
      this.drawPlayer(ctx, p, tNow);
    }

    // boss
    if(this.boss){ this.drawBoss(ctx, this.boss, tNow); }

    // bullets
    ctx.fillStyle='#a5d6a7';
    for(const b of this.bullets){ ctx.beginPath(); ctx.arc(b.x,b.y,4,0,Math.PI*2); ctx.fill(); }

    // effects
    for(const fx of this.effects){
      if(fx.type==='slash'){ ctx.strokeStyle='#e3f2fd'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(fx.x,fx.y,20+fx.t*60,Math.PI*0.1,Math.PI*1.2); ctx.stroke(); }
      if(fx.type==='block'){ ctx.strokeStyle='#ffd54f'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(fx.x,fx.y,16+fx.t*40,0,Math.PI*2); ctx.stroke(); }
      if(fx.type==='trail'){ ctx.fillStyle='#bbdefb88'; ctx.fillRect(fx.x-20,fx.y-10,40*(1-fx.t),20*(1-fx.t)); }
      if(fx.type==='shock'){ ctx.strokeStyle='#ff7043'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(fx.x,fx.y,10+fx.t*140,0,Math.PI*2); ctx.stroke(); }
    }

    ctx.restore();

    // HP bar at bottom
    const p0=this.players[0];
    const hpBarW = 200;
    const hpBarH = 24;
    const hpBarX = 12;
    const hpBarY = this.H - 40;
    
    // HP bar background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    
    // HP bar fill
    const hpPercent = Math.max(0, p0.hp) / 100;
    const hpColor = hpPercent > 0.5 ? '#66bb6a' : hpPercent > 0.25 ? '#ffb74d' : '#ef5350';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX + 2, hpBarY + 2, (hpBarW - 4) * hpPercent, hpBarH - 4);
    
    // HP text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`HP: ${Math.max(0, p0.hp|0)} / 100`, hpBarX + hpBarW/2, hpBarY + 17);
  }

  // --- realm control ---
  restartRealm(){
    this.addArena(); this.enemies.length=0; this.spawnWave(4); this.boss=null;
    this.players.forEach(p=>{ p.hp=100; p.alive=true; });
    this.togglePause(false);
  }
  nextRealm(){
    this.realmIndex=(this.realmIndex+1)%this.realms.list.length;
    this.realms.setActive(this.realmIndex);
    this.restartRealm(); this.log(`Entering ${this.realms.active.name}.`);
  }
  returnToMenu(){
    // Reload the page to return to menu
    window.location.reload();
  }
}

export { Rect, Platform, clamp, lerp, rand, now };
