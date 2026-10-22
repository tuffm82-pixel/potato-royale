/* Persistent paper-cutout rendering. Visual cues never change combat outcomes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PotatoMotion=api;})(typeof window!=='undefined'?window:globalThis,()=>{
'use strict';
const groups={float:['ghost','lantern','bat','owl','star','moon','cloud','flame','kite'],hop:['frog','rabbit','radish','mushroom'],slither:['snake','snail','octopus'],scuttle:['crab','beetle','spider'],waddle:['turtle','bear','barrel','anvil','tree','shield','teapot']};
const champions={'potato-man':'hero','super-spud':'charged',chef:'chef',barry:'barry','greg-the-sausage':'sausage','three-french-men':'sketcher'};
function hash(id){return [...id].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);}
function describe(card){const shape=card.visual?.shape||card.design?.shape||'',seed=hash(card.id);return {gait:champions[card.id]||Object.keys(groups).find(k=>groups[k].includes(shape))||(card.type==='tank'?'waddle':card.type==='swarm'?'scuttle':'walk'),attack:card.type==='healer'?'heal':card.type==='ranged'?'recoil':card.type==='bomber'?'throw':'swing',duration:(card.type==='tank'?.8:.48)+(seed%17)/100,phase:-(seed%97)/100};}
const recent=(now,at,window)=>Number.isFinite(at)&&now>=at&&now-at<window;
function pose(unit,now){return {moving:recent(now,unit.movedAt,.65),attacking:recent(now,unit.attackAt,.34),hurt:recent(now,unit.hitAt,.20),healing:recent(now,unit.healAt,.5),casting:recent(now,unit.abilityAt,.6)};}
function createRenderer(container){
 const units=new Map(),towers=new Map(),effects=new Map();let match=null,now=0;
 const el=(tag,className)=>{const n=document.createElement(tag);n.className=className;return n;};
 function place(n,item){n.style.left=item.x+'%';n.style.top=item.y+'%';}
 function reset(){container.replaceChildren();units.clear();towers.clear();effects.clear();}
 function unitNode(u){const n=el('div','unit'),shadow=el('span','unit-shadow'),body=el('span','sprite-pose'),motion=el('span','sprite-motion'),attack=el('span','sprite-attack'),img=el('img','sprite-image'),hp=el('span','hp-track'),fill=el('span','hp'),status=el('span','unit-status');
  const c=window.PotatoGame.card(u.cardId)||u,style=describe({...c,id:u.cardId});img.src=window.POTATO_UNITS?.[u.cardId]||window.POTATO_ART?.[u.cardId]||'';img.alt=u.name;img.draggable=false;n.title=u.name;n.dataset.unit=u.id;n.dataset.gait=style.gait;n.dataset.attack=style.attack;n.style.setProperty('--stride',style.duration+'s');n.style.setProperty('--phase',style.phase+'s');n.style.setProperty('--facing',u.side==='player'?-1:1);attack.append(img);motion.append(attack);body.append(motion);hp.append(fill);n.append(shadow,body,hp,status);container.append(n);return {n,fill,status,removedAt:null};
 }
 function towerNode(t){const n=el('div','tower'),img=el('img','tower-drawing'),banner=el('span','tower-banner'),hp=el('small','');img.src='tower-keeper.png';img.alt=(t.side==='player'?'Your':'Opponent')+' '+(t.king?'captain':'guard')+' in tower';banner.textContent=t.king?'★':'⚑';banner.setAttribute('aria-hidden','true');n.append(img,banner,hp);container.append(n);return {n,hp};}
 const labels={'potato-man':'WHOOSH!','super-spud':'ZAP!',chef:'SHING!',barry:'BACKUP!','greg-the-sausage':'SIZZLE!','three-french-men':'DRAW!',spell:'POW!',heal:'+'};
 function effectNode(f,width,height){const n=el('div','combat-fx'),name=f.kind||'spell';n.dataset.kind=name;n.setAttribute('aria-hidden','true');place(n,f);n.style.setProperty('--fx-color',f.side==='player'?'#246f8a':'#b04732');
  if(name==='shot'){n.classList.add('projectile');n.style.setProperty('--travel-x',((f.fromX-f.x)/100*width)+'px');n.style.setProperty('--travel-y',((f.fromY-f.y)/100*height)+'px');n.textContent='✦';}
  else if(name==='strike'){n.classList.add('pencil-strike');n.textContent='〃';}
  else{n.classList.add('comic-burst');if(name==='spell'&&window.POTATO_ART?.[f.cardId]){const stamp=el('img','spell-stamp');stamp.src=window.POTATO_ART[f.cardId];stamp.alt='';n.append(stamp);}const word=el('span','burst-word');word.textContent=labels[name]||'POW!';n.append(word);}
  container.append(n);return {n,until:now+(name==='shot'?.34:.65)};
 }
 function render(b,paused=false){if(match!==b.id){reset();match=b.id;}now=b.elapsed;container.classList.toggle('motion-paused',paused||!!b.result);container.classList.toggle('network-motion',!!b.online);
  for(const t of b.towers){let e=towers.get(t.id);if(!e){e=towerNode(t);towers.set(t.id,e);}place(e.n,t);e.n.className=`tower ${t.side} ${t.king?'king':''} ${t.hp<=0?'dead':''} ${recent(now,t.attackAt,.24)?'tower-firing':''} ${recent(now,t.hitAt,.22)?'taking-hit':''}`;e.hp.textContent=Math.max(0,Math.ceil(t.hp));}
  const alive=new Set();for(const u of b.units){alive.add(u.id);let e=units.get(u.id);if(!e){e=unitNode(u);units.set(u.id,e);}const p=pose(u,now);e.removedAt=null;place(e.n,u);e.n.className=`unit ${u.side} ${u.type} ${u.rarity} ${u.ready>0?'deploying':''} ${u.boostUntil>now||u.blitzUntil>now?'boosted':''} ${u.flyingUntil>now?'flying':''} ${u.focusUntil>now?'focused':''} ${u.stunUntil>now?'stunned':''} ${p.moving?'moving':'idle'} ${p.attacking?'attacking':''} ${p.hurt?'taking-hit':''} ${p.healing?'being-healed':''} ${p.casting?'casting':''}`;e.fill.style.width=Math.max(0,u.hp/u.maxHp)*100+'%';e.status.textContent=u.stunUntil>now?'ϟ':u.focusUntil>now?'◎':u.flyingUntil>now?'↑':'';}
  for(const [id,e] of units)if(!alive.has(id)){if(e.removedAt===null){e.removedAt=now;e.n.classList.add('defeated');}if(now-e.removedAt>.4){e.n.remove();units.delete(id);}}
  const currentEffects=new Set();let size=null;for(const f of b.effects){const id=f.id||`${f.kind}:${f.x}:${f.y}`;currentEffects.add(id);if(!effects.has(id)){size=size||[container.clientWidth,container.clientHeight];effects.set(id,effectNode(f,...size));}}
  for(const [id,e] of effects){if(e.n&&now>=e.until){e.n.remove();e.n=null;}if(!currentEffects.has(id)&&!e.n)effects.delete(id);}
 }
 return {render,reset};
}
return {describe,pose,createRenderer};
});
