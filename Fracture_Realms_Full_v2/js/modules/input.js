
export class Input {
  constructor(){
    this.keys={};
    addEventListener('keydown', e=>{ this.keys[e.key.toLowerCase()]=true; if(['e','u','p'].includes(e.key.toLowerCase())) e.preventDefault(); });
    addEventListener('keyup', e=> this.keys[e.key.toLowerCase()]=false);
    this.mouse={x:innerWidth/2,y:innerHeight/2};
    addEventListener('mousemove', e=>{ this.mouse.x=e.clientX; this.mouse.y=e.clientY; });
    addEventListener('contextmenu', e=> e.preventDefault());

    this.gamepadEnabled=true;
    this.padState=null;
  }
  p1(){
    const k=this.keys, g=this.padState;
    const ax = (k['a']?-1:0) + (k['d']?1:0);
    return {
      ax: g? (Math.abs(g.ax)>0.15? g.ax : ax) : ax,
      jump: k['w'] || (g?.a),
      melee: k['j'] || (g?.x),
      magic: k['y'] || (g?.y),
      dash: k['l'] || (g?.b),
      grapple: k['e'] || (g?.rb),
      style1: k['1'], style2: k['2'], style3: k['3'],
    };
  }
  p2(){
    const k=this.keys;
    return { ax: ((k['arrowleft']?-1:0)+(k['arrowright']?1:0)), jump: !!k['arrowup'], melee: !!k['/'], magic: !!k['.'], dash: !!k['0'], grapple: !!k['control'], style1: !!k['7'], style2: !!k['8'], style3: !!k['9'] };
  }
  pollGamepad(){
    if(!this.gamepadEnabled) return;
    const pads = navigator.getGamepads?.();
    const p = pads && pads[0];
    if(!p){ this.padState=null; return; }
    const ax = p.axes?.[0]||0;
    this.padState = {
      ax,
      a: p.buttons?.[0]?.pressed,
      b: p.buttons?.[1]?.pressed,
      x: p.buttons?.[2]?.pressed,
      y: p.buttons?.[3]?.pressed,
      lb: p.buttons?.[4]?.pressed,
      rb: p.buttons?.[5]?.pressed,
      start: p.buttons?.[9]?.pressed,
    };
  }
}
