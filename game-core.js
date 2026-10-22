(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PotatoGame=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const RARITIES={common:{name:'Common',color:'#a9b4c0'},uncommon:{name:'Uncommon',color:'#65d58a'},rare:{name:'Rare',color:'#62b2ff'},epic:{name:'Epic',color:'#ba87ff'},legendary:{name:'Legendary',color:'#ffdb66'},champion:{name:'Champion',color:'#ffa449'}};
const ARENAS=Array.from({length:30},(_,i)=>({number:i+1,name:`Arena ${i+1}`,trophies:Math.round((180*i+24*i*i)/10)*10}));
const starterNames=['Spud Scout','Pea Shooter','Carrot Guard','Onion Knight','Corn Cannon','Bean Brigade','Chilli Burst','Turnip Tank','Radish Runner','Garlic Mage','Mushroom Medic','Cabbage Catapult'];
const foods=['Broccoli','Tomato','Pumpkin','Pickle','Lemon','Avocado','Pepper','Beetroot','Cucumber','Aubergine','Courgette','Sweetcorn','Lettuce','Celery','Olive'];
const jobs=['Scout','Guard','Archer','Giant','Wizard','Swarm','Bomber','Healer'];
const special=[['potato-man','Potato Man','A potato with a cape.','PM'],['greg-the-sausage','Greg the Sausage','A sausage with eyes and a mouth.','GS'],['barry','Barry','An orange circle character.','B'],['three-french-men','Stick Man','A pencil-drawn champion who sketches allies into battle.','SM']];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function makeCard(name,i){let type=['fighter','ranged','tank','swarm','spell','healer'][i%6];if(i===1)type='ranged';if(i===4)type='ranged';if(i===6)type='spell';if(i===7)type='tank';const cost={fighter:3,ranged:4,tank:5,swarm:3,spell:4,healer:3}[type];return {id:slug(name),name,rarity:i<8?'common':['uncommon','rare','epic','legendary'][Math.floor((i-8)/8)%4],type,cost,unlock:i<12?1:Math.min(29,2+Math.floor((i-12)/4)),hp:type==='tank'?1000:type==='swarm'?150:420,damage:type==='spell'?240:type==='tank'?100:type==='healer'?32:75,range:type==='ranged'?20:type==='healer'?18:6,speed:type==='tank'?6:type==='swarm'?13:10,count:type==='swarm'?3:1,description:type==='spell'?'Area damage at the selected point.':type==='healer'?'Restores nearby allies while advancing.':type==='tank'?'A slow, durable front-line troop.':type==='ranged'?'Attacks enemies from a distance.':type==='swarm'?'Deploys three small troops.':'A balanced close-range troop.',mark:name.split(' ').map(w=>w[0]).join('').slice(0,2),art:null};}
special.push(['super-spud','Super Spud','A lightning-powered potato hero.','SS'],['chef','Chef','A focused chef with sharpened blades.','CH']);
const names=[...starterNames,...foods.flatMap(f=>jobs.map(j=>`${f} ${j}`))].slice(0,121);
const CARDS=names.map(makeCard).concat(special.map((s,i)=>({...makeCard(s[1],123+i),id:s[0],description:s[2],mark:s[3],rarity:'champion',unlock:[20,23,26,30,22,24][i],type:i===3?'swarm':i===2?'tank':'fighter',hp:i===2?1400:i===3?420:i===5?600:1000,damage:i===3?90:i===5?85:155,cost:i===2?3:i===5?2:5,count:i===3?3:1,range:7,speed:10})));
const ROLES={
 fighter:{label:'Fighter',hp:440,damage:80,range:6,speed:11,cost:3,count:1,attackInterval:.9,targets:'ground',splash:0,description:'A close-range troop that attacks enemy troops and towers.'},
 ranged:{label:'Ranged',hp:310,damage:70,range:20,speed:9,cost:4,count:1,attackInterval:1.2,targets:'ground',splash:0,description:'Attacks troops and towers from a distance. Protect it with a front line.'},
 tank:{label:'Tank',hp:1150,damage:125,range:7,speed:6,cost:5,count:1,attackInterval:1.5,targets:'buildings',splash:0,description:'A durable, slow troop that ignores enemy troops and targets towers.'},
 swarm:{label:'Swarm',hp:150,damage:45,range:5,speed:13,cost:3,count:3,attackInterval:.85,targets:'ground',splash:0,description:'Three fast, fragile troops. Each deals its own damage.'},
 spell:{label:'Spell',hp:0,damage:240,range:0,speed:0,cost:4,count:1,attackInterval:1,targets:'area',splash:18,description:'Instant area damage anywhere on the field. Deals 40% damage to towers.'},
 healer:{label:'Healer',hp:350,damage:35,range:18,speed:9,cost:3,count:1,attackInterval:1,targets:'allies',splash:0,description:'Heals wounded friendly troops. Never attacks enemies or heals towers.'},
 bomber:{label:'Bomber',hp:290,damage:90,range:17,speed:8,cost:4,count:1,attackInterval:1.5,targets:'ground',splash:8,description:'Throws an explosive that damages the target and nearby enemies.'}
};
const ABILITIES={
 'potato-man':{name:'Fly Form',cost:2,cooldown:14,duration:6,description:'Fly over the river for 6 seconds. Ground melee attacks cannot hit; ranged attacks, towers and spells can.'},
 'greg-the-sausage':{name:'Sizzle Burst',cost:2,cooldown:12,duration:0,description:'Deal 220 damage to enemies within 18 units. Towers take 40% damage.'},
 'barry':{name:"Barry's Backup",cost:3,cooldown:16,duration:0,description:'Summon two carrot guards with ranged attacks to fight alongside Barry.'},
 'super-spud':{name:'Lightning Lord',cost:2,cooldown:14,duration:0,description:'Deal 240 lightning damage within 20 units and stun enemies for 1.2 seconds. Towers take 40% damage.'},
 'chef':{name:'Sharpened Senses',cost:2,cooldown:14,duration:6,description:'For 6 seconds, attack twice as fast and deal 25% more damage.'},
 'three-french-men':{name:'Sketch Summon',cost:2,cooldown:14,duration:0,description:'Sketch a random ally into battle.'}
};
const starterRoles=['fighter','ranged','fighter','fighter','ranged','swarm','spell','tank','fighter','ranged','healer','bomber'];
for(let i=0;i<CARDS.length;i++){
 const c=CARDS[i];if(c.rarity==='champion'){Object.assign(c,{attackInterval:1.1,deployTime:1,targets:c.id==='barry'?'buildings':'ground',splash:0,ability:ABILITIES[c.id]});continue;}
 const job=c.name.split(' ').at(-1);const type=i<12?starterRoles[i]:({Scout:'fighter',Guard:'fighter',Archer:'ranged',Giant:'tank',Wizard:'ranged',Swarm:'swarm',Bomber:'bomber',Healer:'healer'}[job]||'fighter');
 Object.assign(c,ROLES[type],{type,deployTime:type==='spell'?0:1});if(job==='Wizard'||c.id==='garlic-mage'){c.splash=8;c.attackInterval=1.5;c.description='Casts an area attack that hits nearby enemies around its target.';}
}
// Identity is independent of the historical save key and combat role.
const identities=`Tin Duelist|robot|sword
Lantern Wisp|ghost|lantern
Coral Pincer|crab|spear
Iron Scarab|beetle|shield
Ribbon Viper|snake|fan
Moon Scribe|owl|quill
Echo Glider|bat|bell
Reef Oracle|fish|orb
Ink Juggler|octopus|flask
Shell Bastion|turtle|hammer
Bog Hopper|frog|net
Ember Prowler|fox|torch
Honey Mauler|bear|axe
Velvet Courier|rabbit|scroll
Bramble Roller|hedgehog|shield
Spiral Pilgrim|snail|staff
Falling Star|star|wand
Crescent Reaper|moon|scissors
Storm Herald|cloud|trumpet
Cinder Dancer|flame|fan
Quartz Sentinel|crystal|spear
Toadstool Brewer|mushroom|flask
Desert Lancer|cactus|spear
Willow Elder|tree|staff
Runic Grimoire|book|orb
Beacon Watcher|lantern|compass
Porcelain Duchess|teapot|umbrella
Clockwork Marshal|clock|sword
Mimic Hoarder|chest|chain
Barrel Brawler|barrel|hammer
Forge Heart|anvil|torch
Bronze Chimer|bell|drum
Polar Puller|magnet|hook
Rocket Rascal|rocket|flag
Harbor Warden|anchor|chain
Aegis Walker|shield|axe
Silk Soarer|kite|bow
Frost Sculptor|snowman|brush
Straw Trickster|scarecrow|wand
Mapmaker|human|compass
Copper Tinkerer|robot|wrench
Shroud Whisper|ghost|scroll
Tide Grappler|crab|net
Jewel Burrower|beetle|hammer
Coil Charmer|snake|trumpet
Night Surveyor|owl|compass
Velvet Swooper|bat|hook
Pearl Diviner|fish|staff
Tentacle Tailor|octopus|needle
Moss Caravan|turtle|flag
Pond Troubadour|frog|drum
Redwood Stalker|fox|bow
Glacier Wrestler|bear|chain
Burrow Sprinter|rabbit|lantern
Thistle Fencer|hedgehog|sword
Dew Collector|snail|flask
Nova Spark|star|torch
Lunar Weaver|moon|needle
Nimbus Piper|cloud|flute
Ash Conjurer|flame|staff
Prism Seer|crystal|orb
Spore Alchemist|mushroom|wand
Thorn Outrider|cactus|boomerang
Oak Colossus|tree|hammer
Atlas Wanderer|book|compass
Firefly Guide|lantern|flag
Steam Host|teapot|fan
Pendulum Judge|clock|hammer
Treasure Tooth|chest|sword
Powder Cooper|barrel|cannon
Steel Shaper|anvil|wrench
Silver Resonator|bell|wand
Lodestone Sage|magnet|orb
Comet Rider|rocket|spear
Deepsea Dredger|anchor|net
Mirror Paladin|shield|sword
Paper Acrobat|kite|ribbon
Icicle Jester|snowman|bell
Harvest Haunter|scarecrow|hook
Wandering Cartographer|human|scroll
Spring Automaton|robot|scissors
Phantom Ferryman|ghost|oar
Fiddler Corsair|crab|axe
Dungball Drifter|beetle|orb
Emerald Sidewinder|snake|dagger
Feather Librarian|owl|book
Cavern Listener|bat|lantern
Swordfish Skipper|fish|sword
Kraken Drummer|octopus|drum
Terracotta Bulwark|turtle|shield
Lily Acrobat|frog|umbrella
Winter Forager|fox|basket
Blackberry Bruiser|bear|club
Clockwork Hare|rabbit|wrench
Needle Nomad|hedgehog|needle
Marble Wanderer|snail|flag
Astral Navigator|star|compass
Eclipse Mask|moon|fan
Thunder Tumbler|cloud|hammer
Hearth Tender|flame|poker
Amethyst Lens|crystal|scroll
Morel Mystic|mushroom|orb
Saguaro Sheriff|cactus|lasso
Rootbound Guardian|tree|shield
Origami Sage|book|brush
Signal Keeper|lantern|bell
Kettle Monarch|teapot|sceptre
Hourglass Hermit|clock|staff
Vault Gobbler|chest|fork
Cask Captain|barrel|hook`.split('\n').map(row=>row.split('|'));
const accents=['#da674f','#6aaa9f','#a087bc','#e5b84e','#7b9fce','#b1ba65'];
for(let i=0;i<CARDS.length;i++){
 const c=CARDS[i];let shape='human',equipment='sword';
 if(i>=12&&i<121){const identity=identities[i-12];c.name=identity[0];shape=identity[1];equipment=identity[2];c.mark=c.name.split(' ').map(w=>w[0]).join('').slice(0,2);}
 else if(i<12){shape=['potato','pea','carrot','onion','corn','bean','chilli','turnip','radish','garlic','mushroom','cabbage'][i];equipment=['dagger','cannon','shield','sword','cannon','spear','flame','shield','boots','staff','satchel','catapult'][i];}
 else {shape=({'potato-man':'potato','greg-the-sausage':'sausage',barry:'orange','three-french-men':'stickman','super-spud':'potato',chef:'human'})[c.id];equipment=({'potato-man':'cape','greg-the-sausage':'fork',barry:'crown','three-french-men':'pencil','super-spud':'lightning',chef:'cleaver'})[c.id];}
 if(c.id==='three-french-men')Object.assign(c,{name:'Stick Man',mark:'SM',type:'fighter',count:1,cost:2,hp:420,damage:90,description:'A single pencil-drawn champion who sketches allies into battle.'});
 c.archetype=c.name;c.accessory=equipment;c.design={shape,equipment,palette:accents[i%accents.length]};c.visual={shape,prop:equipment,accent:c.design.palette,detail:c.archetype};
}
const card=id=>CARDS.find(c=>c.id===id);
const SKETCH_SUMMON_TABLE=Object.freeze([
 Object.freeze({cardId:'spud-scout',rarity:'common',probability:.5,upperBound:.5}),
 Object.freeze({cardId:'tomato-wizard',rarity:'epic',probability:.3,upperBound:.8}),
 Object.freeze({cardId:'pumpkin-wizard',rarity:'legendary',probability:.15,upperBound:.95}),
 Object.freeze({cardId:'potato-man',rarity:'champion',probability:.05,upperBound:1})
]);
function pickSketchSummon(rng=Math.random){const roll=rng();return SKETCH_SUMMON_TABLE.find(entry=>roll<entry.upperBound)?.cardId||'potato-man';}
const SKETCH_SUMMON_DESCRIPTION=SKETCH_SUMMON_TABLE.map(entry=>`${Math.round(entry.probability*100)}% ${card(entry.cardId).name} (${RARITIES[entry.rarity].name})`).join(', ')+'. Summoned allies cannot use Champion abilities.';
Object.assign(ABILITIES['three-french-men'],{name:'Sketch Summon',duration:0,description:SKETCH_SUMMON_DESCRIPTION});
const arenaFor=t=>[...ARENAS].reverse().find(a=>t>=a.trophies)||ARENAS[0];
function newProfile(){const owned=Object.fromEntries(CARDS.slice(0,12).map(c=>[c.id,{level:1,copies:12}]));const deck=CARDS.slice(0,8).map(c=>c.id);return {version:1,claimedMatches:[],name:'Potato Player',gold:1500,gems:100,trophies:0,best:0,wins:0,losses:0,owned,decks:[deck,[...deck],[...deck]],activeDeck:0,chests:[],daily:0,clan:null,history:[]};}
function deckReport(s,deck){const errors=[];if(!Array.isArray(deck)||deck.length!==8)return {valid:false,errors:['A deck needs exactly 8 cards.'],average:0,champions:0};if(new Set(deck).size!==8)errors.push('Each card can appear only once.');if(deck.some(id=>!card(id)||!s.owned[id]))errors.push('You can only use cards you own.');const cards=deck.map(card).filter(Boolean),champions=cards.filter(c=>c.rarity==='champion').length;if(champions>1)errors.push('A deck can contain only 1 Champion.');return {valid:!errors.length,errors,average:cards.reduce((sum,c)=>sum+c.cost,0)/8,champions};}
function validDeck(s,deck){return deckReport(s,deck).valid;}
function replaceCard(s,deckIndex,slot,id){if(!Number.isInteger(deckIndex)||deckIndex<0||deckIndex>2||!Number.isInteger(slot)||slot<0||slot>7||!card(id))return {ok:false,reason:'Choose a valid card and deck slot.'};const next=[...s.decks[deckIndex]];next[slot]=id;const report=deckReport(s,next);if(!report.valid)return {ok:false,reason:report.errors[0]};s.decks[deckIndex]=next;return {ok:true};}
function loadProfile(input){const fallback=newProfile();if(!input||input.version!==1)return fallback;const s={...fallback};s.claimedMatches=Array.isArray(input.claimedMatches)?input.claimedMatches.filter(id=>typeof id==='string'&&/^[a-f0-9]{24}$/.test(id)).slice(-100):[];for(const key of ['gold','gems','trophies','best','wins','losses','daily'])if(Number.isFinite(input[key])&&input[key]>=0)s[key]=Math.min(key==='daily'?Number.MAX_SAFE_INTEGER:1e9,Math.floor(input[key]));s.name=typeof input.name==='string'?input.name.slice(0,24):s.name;const owned={};for(const c of CARDS){const value=input.owned?.[c.id];if(value&&Number.isInteger(value.level)&&value.level>=1&&value.level<=15)owned[c.id]={level:value.level,copies:Number.isFinite(value.copies)?Math.max(0,Math.floor(value.copies)):0};}s.owned={...fallback.owned,...owned};s.decks=[0,1,2].map(i=>validDeck(s,input.decks?.[i])?[...input.decks[i]]:[...fallback.decks[0]]);s.activeDeck=[0,1,2].includes(input.activeDeck)?input.activeDeck:0;s.chests=Array.isArray(input.chests)?input.chests.filter(c=>c&&typeof c.id==='string'&&Number.isFinite(c.ready)&&Number.isInteger(c.arena)&&c.arena>=1&&c.arena<=30).slice(0,4):[];s.history=Array.isArray(input.history)?input.history.filter(h=>h&&typeof h.result==='string'&&Number.isFinite(h.delta)).slice(0,20):[];if(input.clan&&typeof input.clan.name==='string'){s.clan={name:input.clan.name.slice(0,24),messages:Array.isArray(input.clan.messages)?input.clan.messages.filter(m=>m&&typeof m.name==='string'&&typeof m.text==='string').slice(-40).map(m=>({name:m.name.slice(0,24),text:m.text.slice(0,160)})):[],requested:Number.isFinite(input.clan.requested)?input.clan.requested:0};}return s;}
function stats(c,level=1){const factor=1+0.08*(level-1);return {...c,hp:Math.round(c.hp*factor),damage:Math.round(c.damage*factor)};}
function upgradeCost(level){return {gold:100*level*level,copies:4+level*4};}
function upgradeReport(s,id){const o=s.owned[id];if(!card(id)||!o)return {ok:false,reason:'Collect this card first.'};if(o.level>=15)return {ok:false,reason:'Maximum level reached.',max:true};const cost=upgradeCost(o.level),missingGold=Math.max(0,cost.gold-s.gold),missingCopies=Math.max(0,cost.copies-o.copies);return {ok:!missingGold&&!missingCopies,cost,missingGold,missingCopies,reason:missingGold||missingCopies?`Need ${[missingGold?`${missingGold} more gold`:'',missingCopies?`${missingCopies} more copies`:''].filter(Boolean).join(' and ')}.`:'Ready to upgrade.'};}
function upgrade(s,id){const report=upgradeReport(s,id);if(!report.ok)return false;const o=s.owned[id];s.gold-=report.cost.gold;o.copies-=report.cost.copies;o.level++;return true;}
function rewardCards(s,amount,rng=Math.random,arena=arenaFor(s.trophies).number){const pool=CARDS.filter(c=>c.unlock<=arena);const rewards=[];for(let i=0;i<amount;i++){const c=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];if(!s.owned[c.id])s.owned[c.id]={level:1,copies:0};s.owned[c.id].copies+=2;rewards.push(c.name);}return rewards;}
function claimChest(s,id,now=Date.now(),rng=Math.random){const i=s.chests.findIndex(c=>c.id===id);if(i<0||s.chests[i].ready>now)return null;const chest=s.chests.splice(i,1)[0];const gold=150+30*chest.arena;s.gold+=gold;return {gold,cards:rewardCards(s,4,rng,chest.arena)};}
function buyChest(s,rng=Math.random){if(s.gold<500)return null;s.gold-=500;return rewardCards(s,6,rng);}
function claimDaily(s,now=Date.now()){if(now-s.daily<86400000)return false;s.daily=now;s.gold+=300;s.gems+=10;return true;}
let serial=0;
function createBattle(profile,training=false,rng=Math.random){
 if(!validDeck(profile,profile.decks[profile.activeDeck]))throw new Error('Choose a valid eight-card deck.');
 const arena=arenaFor(profile.trophies).number,pool=CARDS.filter(c=>c.unlock<=arena);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 let champion=false;const enemyDeck=pool.filter(c=>{if(c.rarity!=='champion')return true;if(champion)return false;champion=true;return true;}).slice(0,8).map(c=>c.id);
 const decks={player:[...profile.decks[profile.activeDeck]],enemy:enemyDeck};const levels={player:Object.fromEntries(Object.entries(profile.owned).map(([id,o])=>[id,o.level])),enemy:Object.fromEntries(enemyDeck.map(id=>[id,Math.min(15,1+Math.floor(arena/3))]))};const towers=[];
 for(const side of ['player','enemy'])for(const x of [23,77,50]){const king=x===50,hp=(king?2200:1400)*(side==='enemy'?1+(arena-1)*.045:1);towers.push({id:`${side}-${x}`,side,x,y:side==='player'?(king?94:81):(king?6:19),hp,maxHp:hp,king,cd:0});}
 return {id:`battle-${++serial}`,training,arena,elapsed:0,energy:{player:5,enemy:5},decks,levels,queues:{player:4,enemy:4},units:[],towers,effects:[],abilities:{player:0,enemy:0},result:null,settled:false,ai:1.8,rng};
}
function deployReport(b,side,index){if(b.result)return {ok:false,reason:'This battle has ended.'};if(!['player','enemy'].includes(side)||!Number.isInteger(index)||index<0||index>3)return {ok:false,reason:'Choose a card first.'};const c=card(b.decks[side][index]);if(c.rarity==='champion'&&b.units.some(u=>u.side===side&&u.rarity==='champion'&&!u.summoned&&u.hp>0))return {ok:false,reason:'Your Champion is already on the field.'};if(b.energy[side]<c.cost)return {ok:false,reason:`Need ${Math.ceil(c.cost-b.energy[side])} more cooking oil.`};return {ok:true,reason:c.type==='spell'?'Tap anywhere to cast.':'Deploy on your lower half.'};}
function effect(b,data){b.effects.push({id:`fx-${++serial}`,startedAt:b.elapsed,duration:data.life,...data,life:b.online?Math.max(1.2,data.life):data.life});}
function hurt(b,target,damage){target.hp-=damage;target.hitAt=b.elapsed;}
function attackCue(b,unit,target,kind){unit.attackAt=b.elapsed;unit.attackTarget={x:target.x,y:target.y};effect(b,{x:target.x,y:target.y,fromX:unit.x,fromY:unit.y,life:kind==='shot'?.32:.28,side:unit.side,kind,cardId:unit.cardId||'tower'});}
function areaDamage(b,side,x,y,radius,damage){for(const t of [...b.units,...b.towers])if(t.side!==side&&t.hp>0&&Math.hypot(t.x-x,t.y-y)<=radius)hurt(b,t,Math.round(damage*(t.king!==undefined?.4:1)));}
function deploy(b,side,index,x,y){
 if(!deployReport(b,side,index).ok||!Number.isFinite(x)||!Number.isFinite(y)||x<4||x>96||y<3||y>97)return false;
 const id=b.decks[side][index],c=stats(card(id),b.levels[side][id]||1);if(c.type!=='spell'&&(side==='player'?y<54:y>46))return false;b.energy[side]-=c.cost;
 if(c.type==='spell'){areaDamage(b,side,x,y,c.splash,c.damage);b.effects.push({x,y,life:.6,side,kind:'spell',cardId:id,radius:c.splash});}
 else {const group=`group-${++serial}`;for(let n=0;n<c.count;n++)b.units.push({...c,id:`unit-${++serial}`,group,cardId:id,side,summoned:false,x:Math.max(4,Math.min(96,x+(n-(c.count-1)/2)*4)),y,hp:c.hp,maxHp:c.hp,cd:0,ready:c.deployTime,boostUntil:0,blitzUntil:0,flyingUntil:0,focusUntil:0,stunUntil:0});if(c.rarity==='champion')b.abilities[side]=b.elapsed;}
 const q=b.queues[side];[b.decks[side][index],b.decks[side][q]]=[b.decks[side][q],b.decks[side][index]];b.queues[side]=(q+1)%8;if(b.queues[side]<4)b.queues[side]=4;return true;
}
function abilityReport(b,side){const unit=b.units.find(u=>u.side===side&&u.rarity==='champion'&&!u.summoned&&u.hp>0);if(!unit||b.result)return {exists:false,ready:false,reason:'Deploy a Champion to use its ability.'};const ability=ABILITIES[unit.cardId],remaining=Math.max(0,(b.abilities[side]||0)-b.elapsed);const reason=unit.ready>0?'Champion is deploying.':remaining>0?`Ready in ${Math.ceil(remaining)}s.`:b.energy[side]<ability.cost?`Need ${ability.cost} cooking oil.`:'Ready';return {...ability,exists:true,cardId:unit.cardId,remaining,ready:unit.ready<=0&&remaining===0&&b.energy[side]>=ability.cost,reason};}
function activateAbility(b,side){const a=abilityReport(b,side);if(!a.ready)return false;const unit=b.units.find(u=>u.side===side&&u.cardId===a.cardId&&!u.summoned&&u.hp>0);b.energy[side]-=a.cost;b.abilities[side]=b.elapsed+a.cooldown;unit.abilityAt=b.elapsed;
 if(a.cardId==='potato-man')unit.flyingUntil=b.elapsed+a.duration;
 if(a.cardId==='greg-the-sausage')areaDamage(b,side,unit.x,unit.y,18,220);
 if(a.cardId==='super-spud'){areaDamage(b,side,unit.x,unit.y,20,240);for(const enemy of [...b.units,...b.towers])if(enemy.side!==side&&enemy.hp>0&&Math.hypot(enemy.x-unit.x,enemy.y-unit.y)<=20)enemy.stunUntil=Math.max(enemy.stunUntil||0,b.elapsed+1.2);}
 if(a.cardId==='chef')unit.focusUntil=b.elapsed+a.duration;
 if(a.cardId==='barry'){
  const guard=stats({...ROLES.ranged,type:'ranged',rarity:'common',name:'Carrot Backup',mark:'CB',hp:260,damage:55},b.levels[side].barry||1);
  for(const offset of [-4,4])b.units.push({...guard,id:`unit-${++serial}`,group:`backup-${serial}`,cardId:'carrot-backup',side,summoned:true,x:Math.max(4,Math.min(96,unit.x+offset)),y:unit.y,hp:guard.hp,maxHp:guard.hp,cd:0,ready:.5,flyingUntil:0,focusUntil:0,stunUntil:0});
 }
 if(a.cardId==='three-french-men'){
  const id=pickSketchSummon(b.rng),ally=stats(card(id),b.levels[side]['three-french-men']||1);
  b.units.push({...ally,ability:undefined,id:`unit-${++serial}`,group:`sketch-${serial}`,cardId:id,side,summoned:true,summonedBy:'three-french-men',x:Math.max(4,Math.min(96,unit.x+4)),y:unit.y,hp:ally.hp,maxHp:ally.hp,cd:0,ready:1,boostUntil:0,blitzUntil:0,flyingUntil:0,focusUntil:0,stunUntil:0});
 }
 effect(b,{x:unit.x,y:unit.y,life:.6,side,kind:a.cardId,radius:a.cardId==='super-spud'?20:18});return true;
}
function crowns(b,side){return b.towers.filter(t=>t.side!==side&&t.hp<=0&&!t.king).length;}
function moveUnit(b,unit,target,dt){let dest=target;const opposite=(unit.y<50&&target.y>50)||(unit.y>50&&target.y<50);if(opposite&&!(unit.flyingUntil>b.elapsed)){const lane=unit.x<50?23:77;dest=Math.abs(unit.x-lane)>2?{x:lane,y:unit.y}:{x:lane,y:unit.side==='player'?44:56};}const distance=Math.hypot(dest.x-unit.x,dest.y-unit.y)||1,step=Math.min(distance,unit.speed*(unit.boostUntil>b.elapsed?1.35:1)*dt);if(step>0)unit.movedAt=b.elapsed;unit.x+=(dest.x-unit.x)/distance*step;unit.y+=(dest.y-unit.y)/distance*step;}
function tick(b,dt){if(b.result)return;dt=Math.max(0,Math.min(.1,dt));b.elapsed+=dt;for(const side of ['player','enemy'])b.energy[side]=Math.min(10,b.energy[side]+dt*(b.elapsed>120?1:.5));if(!b.online)b.ai-=dt;if(!b.online&&b.ai<=0){const index=Math.floor(b.rng()*4);const spell=card(b.decks.enemy[index]).type==='spell';const targets=b.units.filter(u=>u.side==='player'&&u.hp>0);const target=targets[0]||{x:23,y:81};deploy(b,'enemy',index,spell?target.x:(b.rng()<.5?23:77),spell?target.y:25);activateAbility(b,'enemy');b.ai=Math.max(.9,2.8-b.arena*.04)+b.rng();}
 for(const unit of b.units){if(unit.flyingUntil<=b.elapsed)unit.flyingUntil=0;if(unit.focusUntil<=b.elapsed)unit.focusUntil=0;if(unit.hp<=0||unit.stunUntil>b.elapsed)continue;unit.ready=Math.max(0,(unit.ready||0)-dt);if(unit.ready>0)continue;unit.cd-=dt;
 const distance=t=>Math.hypot(t.x-unit.x,t.y-unit.y);const attackEvery=(unit.attackInterval||1)/(unit.blitzUntil>b.elapsed||unit.focusUntil>b.elapsed?2:1),damage=unit.damage*(unit.boostUntil>b.elapsed?1.3:1)*(unit.focusUntil>b.elapsed?1.25:1);
 if(unit.targets==='allies'){
  const allies=b.units.filter(t=>t.side===unit.side&&t.id!==unit.id&&t.hp>0).sort((a,c)=>distance(a)-distance(c));const injured=allies.filter(t=>t.hp<t.maxHp&&distance(t)<=unit.range).sort((a,c)=>a.hp/a.maxHp-c.hp/c.maxHp)[0];
  if(injured){if(unit.cd<=0){injured.hp=Math.min(injured.maxHp,injured.hp+damage);injured.healAt=b.elapsed;attackCue(b,unit,injured,'heal');unit.cd=attackEvery;}continue;}
  const ally=allies[0];if(ally&&distance(ally)>10)moveUnit(b,unit,ally,dt);continue;
 }
 const enemies=(unit.targets==='buildings'?b.towers:[...b.units,...b.towers]).filter(t=>t.hp>0&&t.side!==unit.side&&(!(t.flyingUntil>b.elapsed)||unit.type==='ranged'||unit.type==='bomber'||unit.flyingUntil>b.elapsed)).sort((a,c)=>distance(a)-distance(c));const enemy=enemies[0];if(!enemy)continue;
 if(distance(enemy)<=unit.range){if(unit.cd<=0){attackCue(b,unit,enemy,unit.type==='ranged'||unit.type==='bomber'?'shot':'strike');if(unit.splash>0){for(const t of [...b.units,...b.towers])if(t.side!==unit.side&&t.hp>0&&Math.hypot(t.x-enemy.x,t.y-enemy.y)<=unit.splash)hurt(b,t,Math.round(damage));}else hurt(b,enemy,Math.round(damage));unit.cd=attackEvery;}}
 else moveUnit(b,unit,enemy,dt);
 }
 for(const tower of b.towers){if(tower.hp<=0||tower.stunUntil>b.elapsed)continue;tower.cd-=dt;const target=b.units.filter(u=>u.side!==tower.side&&u.hp>0&&Math.hypot(u.x-tower.x,u.y-tower.y)<26).sort((a,c)=>Math.hypot(a.x-tower.x,a.y-tower.y)-Math.hypot(c.x-tower.x,c.y-tower.y))[0];if(target&&tower.cd<=0){hurt(b,target,tower.king?80:65);attackCue(b,tower,target,'shot');tower.cd=.9;}}
 b.units=b.units.filter(u=>u.hp>0);b.effects=b.effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0);const playerKing=b.towers.find(t=>t.side==='player'&&t.king),enemyKing=b.towers.find(t=>t.side==='enemy'&&t.king);if(playerKing.hp<=0||enemyKing.hp<=0)b.result=playerKing.hp<=0?(enemyKing.hp<=0?'draw':'loss'):'win';else if(b.elapsed>=180){const player=crowns(b,'player'),enemy=crowns(b,'enemy');b.result=player>enemy?'win':player<enemy?'loss':'draw';}}
function settle(s,b){if(!b.result||b.settled)return null;b.settled=true;if(b.online&&!b.training){s.claimedMatches=s.claimedMatches||[];if(s.claimedMatches.includes(b.id))return {result:b.result,delta:0,gold:0,training:false,alreadyClaimed:true};s.claimedMatches.push(b.id);s.claimedMatches=s.claimedMatches.slice(-100);}let delta=0,gold=0;if(!b.training){if(b.result==='win'){delta=Math.max(12,32-Math.floor(b.arena/2));gold=60+10*b.arena;s.wins++;s.gold+=gold;if(s.chests.length<4)s.chests.push({id:`chest-${Date.now()}-${++serial}`,ready:Date.now()+60000,arena:b.arena});}else if(b.result==='loss'){delta=-Math.min(s.trophies,20+Math.floor(b.arena*.7));s.losses++;}s.trophies=Math.max(0,s.trophies+delta);s.best=Math.max(s.best,s.trophies);s.history.unshift({result:b.result,delta,arena:b.arena,at:Date.now()});s.history=s.history.slice(0,20);}return {result:b.result,delta,gold,training:b.training};}
return {RARITIES,ROLES,ABILITIES,SKETCH_SUMMON_TABLE,SKETCH_SUMMON_DESCRIPTION,pickSketchSummon,ARENAS,CARDS,card,arenaFor,newProfile,loadProfile,deckReport,validDeck,replaceCard,stats,upgradeCost,upgradeReport,upgrade,rewardCards,claimChest,buyChest,claimDaily,createBattle,deployReport,deploy,abilityReport,activateAbility,tick,crowns,settle};
});


