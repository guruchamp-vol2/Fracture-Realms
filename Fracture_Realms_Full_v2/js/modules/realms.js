
export function makeRealms(game){
  const realms = [
    { name:'Genesis Expanse', draw(ctx,W,H,g){ ctx.save(); ctx.globalAlpha=0.4; for(let i=0;i<6;i++){ const x=(i/6)*W + Math.sin((performance.now()/1000)+i)*30; ctx.fillStyle=i%2?'#0d1830':'#0b1326'; ctx.fillRect(x-30, H*0.2, 60, H); } ctx.restore(); } },
    { name:'Shattered Echoes', draw(ctx,W,H,g){ const n=18; ctx.save(); ctx.globalAlpha=0.35; for(let i=0;i<n;i++){ const t=performance.now()/1000 + i; const x=(i/n)*W + Math.sin(t*0.6+i)*20; const y=(i%2? (H*0.6 + Math.sin(t*0.9)*H*0.3) : (H*0.4 + Math.cos(t*0.8)*H*0.3)); ctx.fillStyle=i%3?'#14223a':'#0e1b33'; ctx.beginPath(); ctx.moveTo(x,y-20); ctx.lineTo(x+20,y); ctx.lineTo(x,y+20); ctx.lineTo(x-20,y); ctx.closePath(); ctx.fill(); } ctx.restore(); } },
    { name:'Chrono Gully', draw(ctx,W,H,g){ ctx.save(); ctx.globalAlpha = 0.25 + Math.abs(g.timeScale-1)*0.3; const cx=W/2,cy=H/3; ctx.strokeStyle='#64b5f6'; for(let r=40;r<Math.max(W,H); r+=60){ ctx.beginPath(); ctx.arc(cx,cy, r + (performance.now()/120)%60, 0, Math.PI*2); ctx.stroke(); } ctx.restore(); } },
    { name:'Ember Vault', draw(ctx,W,H,g){ ctx.save(); const t=performance.now()/1000; for(let i=0;i<10;i++){ const y=H-(i*30) + Math.sin(t*1.5+i)*5; ctx.fillStyle='rgba(255,100,50,0.10)'; ctx.fillRect(0,y,W,28); } ctx.restore(); } },
    { name:'Dusk Frontier', draw(ctx,W,H,g){ ctx.save(); ctx.globalAlpha=0.3; const t=performance.now()/1000; for(let i=0;i<12;i++){ const x=(i/12)*W + Math.cos(t*0.4+i)*40; ctx.fillStyle='#09122a'; ctx.fillRect(x,0,6,H); } ctx.restore(); } },
    { name:'Rift Plateau', draw(ctx,W,H,g){ ctx.save(); const t=performance.now()/1000; for(let i=0;i<20;i++){ const x=(i/20)*W; const y=H*0.5 + Math.sin(t*1.2+i)*H*0.12; ctx.strokeStyle='rgba(100,180,255,0.18)'; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+W/20,y); ctx.stroke(); } ctx.restore(); } },
    { name:'Glacier Chasm', draw(ctx,W,H,g){ ctx.save(); const t=performance.now()/1000; for(let i=0;i<14;i++){ const y=(i/14)*H; ctx.strokeStyle='rgba(180,220,255,0.14)'; ctx.beginPath(); ctx.moveTo(0,y + Math.cos(t*0.8+i)*6); ctx.lineTo(W, y + Math.sin(t*0.8+i)*6); ctx.stroke(); } ctx.restore(); } },
    { name:'Zenith Apex', draw(ctx,W,H,g){ ctx.save(); const t=performance.now()/1000; ctx.globalAlpha=0.18; for(let i=0;i<32;i++){ const a=(i/32)*Math.PI*2 + t*0.2; const r=Math.min(W,H)*0.4 + Math.sin(t*0.8+i)*20; const x=W/2 + Math.cos(a)*r, y=H/3 + Math.sin(a)*r*0.6; ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(x-2,y-2,4,4); } ctx.restore(); } },
  ];
  let active = realms[0];
  const setActive=(i)=> active = realms[i%realms.length];
  return { list: realms, active, setActive };
}
