const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
(async () => {
 const browser = await chromium.launch({headless:true,...(process.env.SURIS_CHROMIUM_PATH ? {executablePath:process.env.SURIS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']} : {})});
 const page = await browser.newPage({viewport:{width:1150,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setContent('<html><body style="margin:24px;background:#111;color:#eee;font-family:Arial"><div id="host" style="max-width:1060px"></div></body></html>');
 await page.addScriptTag({path:path.join(root,'suris-ecoflow-flow-card.js')});
 await page.evaluate(()=>{
  window.loadCardHelpers=async()=>({createCardElement:()=>({constructor:{getConfigElement:async()=>{
   if(!customElements.get('ha-form'))customElements.define('ha-form',class extends HTMLElement{
    constructor(){super();this.attachShadow({mode:'open'});this._inputs=new Map()}
    set schema(schema){this._schema=schema;this.shadowRoot.replaceChildren();this._inputs.clear();for(const field of schema){
     const label=document.createElement('label');label.textContent=field.name;label.style.display='block';
     const input=document.createElement('input');input.dataset.field=field.name;input.setAttribute('aria-label',field.name);label.append(input);this.shadowRoot.append(label);this._inputs.set(field.name,input);
     input.addEventListener('input',()=>{const raw=input.value;this.data={...this.data,[field.name]:raw===''?undefined:field.selector.number&&Number.isFinite(Number(raw))?Number(raw):raw};this.dispatchEvent(new CustomEvent('value-changed',{detail:{value:this.data},bubbles:true,composed:true}))});
    }this.data=this._data||{}}
    get schema(){return this._schema}
    set data(data){this._data=data;for(const [name,input]of this._inputs){const value=data[name]==null?'':String(data[name]);if(input.value!==value)input.value=value}}
    get data(){return this._data}
   });
  }}})});
  const s=(state,unit='W')=>({state:String(state),attributes:{unit_of_measurement:unit}});
  window.states={'sensor.grid':s(0),'sensor.a_in':s(0),'sensor.a_out':s(150),'sensor.a_soc':s(68,'%'),'sensor.b_in':s(0),'sensor.b_out':s(200),'sensor.b_soc':s(81,'%'),'sensor.main_in':s(.33,'kW'),'sensor.main_ac':s(0),'sensor.main_pv':s(330),'sensor.main_out':s(320),'sensor.main_soc':s(74,'%'),'sensor.home':s(320),'binary_sensor.source':s('off'),'binary_sensor.grid_available':s('off')};
  window.config={type:'custom:suris-ecoflow-flow-card',grid:{power:'sensor.grid',available_entity:'binary_sensor.grid_available',available_state:'on'},auxiliary_1:{soc:'sensor.a_soc',input_power:'sensor.a_in',output_power:'sensor.a_out'},auxiliary_2:{soc:'sensor.b_soc',input_power:'sensor.b_in',output_power:'sensor.b_out'},main:{soc:'sensor.main_soc',input_power:'sensor.main_in',output_power:'sensor.main_out',ac_input_power:'sensor.main_ac',solar_input_power:'sensor.main_pv'},home:{power:'sensor.home',source_entity:'binary_sensor.source',grid_state:'on',main_state:'off'}};
  window.card=document.createElement('suris-ecoflow-flow-card');card.setConfig(config);card.hass={states};document.querySelector('#host').append(card);
  window.refresh=()=>{card.hass={states:{...states}}};
  window.active=()=>[...card.shadowRoot.querySelectorAll('.flow.active')].map(x=>x.dataset.flow).sort();
 });
 await page.waitForFunction(()=>card.shadowRoot.querySelectorAll('.flow').length===7);
 const verifyRoutes=async label=>{
  const geometry=await page.evaluate(()=>{
   const diagram=card.shadowRoot.querySelector('.diagram').getBoundingClientRect();
   const nodes=Object.fromEntries([...card.shadowRoot.querySelectorAll('.node')].map(node=>{const r=node.getBoundingClientRect();return[node.dataset.key,{left:r.left-diagram.left,right:r.right-diagram.left,top:r.top-diagram.top,bottom:r.bottom-diagram.top}]}));
   const paths=[...card.shadowRoot.querySelectorAll('.flow')].map(flow=>{
    const path=flow.querySelector('path'),d=path.getAttribute('d'),length=path.getTotalLength();
    const point=distance=>{const p=path.getPointAtLength(distance);return{x:p.x,y:p.y}};
    const dashes=flow.querySelector('.flow-dashes'),animation=flow._animation,frames=animation.effect.getKeyframes();
    return{name:flow.dataset.flow,d,length,start:point(0),end:point(length),samples:Array.from({length:31},(_,i)=>point(length*i/30)),animationMatches:dashes.getAttribute('d')===d&&animation.effect.target===dashes&&frames[0].strokeDashoffset==='0px'&&frames.at(-1).strokeDashoffset==='-28px'};
   });
   return{width:diagram.width,height:diagram.height,nodes,paths};
  });
  const connections={grid_auxiliary_1:['grid','auxiliary_1'],grid_auxiliary_2:['grid','auxiliary_2'],grid_main:['grid','main'],grid_home:['grid','home'],auxiliary_1_main:['auxiliary_1','main'],auxiliary_2_main:['auxiliary_2','main'],main_home:['main','home']};
  const onBorder=(p,r)=>p.x>=r.left-.25&&p.x<=r.right+.25&&p.y>=r.top-.25&&p.y<=r.bottom+.25&&Math.min(Math.abs(p.x-r.left),Math.abs(p.x-r.right),Math.abs(p.y-r.top),Math.abs(p.y-r.bottom))<.25;
  assert.equal(geometry.paths.length,7,`${label}: missing flow`);
  for(const route of geometry.paths){
   assert((route.d.match(/[A-Za-z]/g)||[]).every(command=>['M','H','V'].includes(command)),`${label}: diagonal or curved ${route.name}`);
   assert(route.animationMatches,`${label}: dashes leave ${route.name} or run backwards`);
   const [source,target]=connections[route.name];
   assert(onBorder(route.start,geometry.nodes[source])&&onBorder(route.end,geometry.nodes[target]),`${label}: incorrect endpoints ${route.name}`);
   for(const p of route.samples){
    assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=-.25&&p.y>=-.25&&p.x<=geometry.width+.25&&p.y<=geometry.height+.25,`${label}: clipped ${route.name}`);
    for(const [key,r]of Object.entries(geometry.nodes))if(key!==source&&key!==target)assert(!(p.x>r.left+.25&&p.x<r.right-.25&&p.y>r.top+.25&&p.y<r.bottom-.25),`${label}: ${route.name} passes through ${key}`);
   }
  }
  const transfer=geometry.paths.find(route=>route.name==='auxiliary_1_main'),home=geometry.paths.find(route=>route.name==='main_home');
  assert.equal(transfer.start.y,transfer.end.y,`${label}: side station transfer is not horizontal`);
  assert.equal((transfer.d.match(/[HV]/g)||[]).length,1,`${label}: first station transfer has extra bends`);
  assert.equal((home.d.match(/[HV]/g)||[]).length,2,`${label}: main-to-home flow must have one corner`);
  assert(Math.abs(home.length-Math.abs(home.end.x-home.start.x)-Math.abs(home.end.y-home.start.y))<.25,`${label}: main-to-home flow has a detour`);
 };
 const verifyBorders=async label=>{
  const result=await page.evaluate(()=>Object.entries(card._nodes).map(([key,node])=>{
   const expected=key!=='home'&&Object.keys(card._data.flows).some(name=>name.startsWith(`${key}_`)&&card._data.flows[name]),border=card._borders[key];
   if(!border)return{key,expected,active:node.classList.contains('supplying'),solid:getComputedStyle(node).borderTopStyle==='solid'};
   const path=border.firstElementChild,len=path.getTotalLength(),points=Array.from({length:100},(_,i)=>path.getPointAtLength(len*i/100));
   const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y},0);
   return{key,expected,active:node.classList.contains('supplying'),state:border._animation.playState,area,frames:border._animation.effect.getKeyframes().map(f=>f.strokeDashoffset),display:getComputedStyle(border).display,stroke:getComputedStyle(path).stroke,color:getComputedStyle(node).getPropertyValue('--node-color').trim(),dash:getComputedStyle(path).strokeDasharray};
  }));
  for(const border of result){assert.equal(border.active,border.expected,`${label}: wrong supplying outline ${border.key}`);if(border.key==='home')assert.equal(border.active,false);assert(border.area>0,`${label}: counterclockwise outline ${border.key}`);assert.deepEqual(border.frames,['0px','-14px']);assert.equal(border.state,border.expected?'running':'paused');assert.equal(border.display,border.expected?'block':'none');assert.equal(border.dash,'7px, 7px')}
 };
 await verifyRoutes('desktop');
 await verifyBorders('stations supply');
 const beforeBorder=await page.evaluate(async()=>{await card._borders.main._animation.ready;return{time:card._borders.main._animation.currentTime,offset:getComputedStyle(card._borders.main.firstElementChild).strokeDashoffset,rate:card._borders.main._animation.playbackRate}});
 await page.waitForTimeout(120);
 assert.notEqual(await page.evaluate(()=>getComputedStyle(card._borders.main.firstElementChild).strokeDashoffset),beforeBorder.offset,'Outline does not move');
 await page.evaluate(()=>{states['sensor.home'].state='1000';refresh()});
 const afterBorder=await page.evaluate(async()=>{await card._borders.main._animation.ready;return{time:card._borders.main._animation.currentTime,rate:card._borders.main._animation.playbackRate}});
 assert(afterBorder.rate>beforeBorder.rate&&afterBorder.time>=beforeBorder.time-.1,'Outline speed failed or restarted');
 await page.evaluate(()=>{states['sensor.home'].state='320';refresh()});
 assert.deepEqual(await page.evaluate(()=>active()),['auxiliary_1_main','auxiliary_2_main','main_home']);
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelectorAll('.flow circle, animateMotion, marker').length),0);
 const flowState=async name=>page.evaluate(async name=>{const flow=card.shadowRoot.querySelector(`[data-flow="${name}"]`);await flow._animation.ready;return{rate:flow._animation.playbackRate,state:flow._animation.playState,time:flow._animation.currentTime,offset:getComputedStyle(flow.querySelector('.flow-dashes')).strokeDashoffset}},name);
 const originalTransferRate=(await flowState('auxiliary_1_main')).rate;
 let previousRate=0;
 for(const watts of [10,100,1000,10000]){
  const before=await flowState('main_home');
  await page.evaluate(watts=>{states['sensor.home'].state=String(watts);refresh()},watts);
  const after=await flowState('main_home');assert(after.rate>previousRate&&after.rate<120/28);assert(after.time>=before.time-.1,'Power update restarted the animation');previousRate=after.rate;
  assert.equal((await flowState('auxiliary_1_main')).rate,originalTransferRate,'Another flow wattage changed transfer speed');
 }
 await page.evaluate(()=>{states['sensor.home'].state='150';refresh()});
 assert.equal((await flowState('main_home')).rate,(await flowState('auxiliary_1_main')).rate,'Equal wattage should have equal speed on different route lengths');
 const moving=await flowState('main_home');await page.waitForTimeout(120);assert.notEqual((await flowState('main_home')).offset,moving.offset,'Dashes do not move');
 for(const value of ['3','0','-10','unavailable','unknown']){
  await page.evaluate(value=>{states['sensor.home'].state=value;refresh()},value);
  assert.equal((await flowState('main_home')).state,'paused');
  await verifyBorders(`home supply stopped: ${value}`);
  assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('[data-flow="main_home"] .flow-dashes')).visibility),'hidden');
 }
 await page.evaluate(()=>{states['sensor.home'].state='320';refresh()});
 assert.equal((await flowState('main_home')).state,'running');
 assert.equal((await flowState('grid_home')).state,'paused');
 const beforeDuration=(await flowState('main_home')).rate;
 await page.evaluate(()=>{card.setConfig({...config,appearance:{duration:6}});refresh()});
 assert.equal((await flowState('main_home')).rate,beforeDuration/2);await page.evaluate(()=>{card.setConfig(config);refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .input .value').textContent),'330 W');
 assert.deepEqual(await page.evaluate(()=>['.main .solar_1','.main .solar_2','.home .power'].map(selector=>card.shadowRoot.querySelector(selector+' .label').textContent)),['XT60(1)','XT60(2)','Вхід']);
 // Each battery follows its own charge sensor, including empty, full and unknown states.
 const batteries=await page.evaluateHandle(()=>['auxiliary_1','auxiliary_2','main'].map(key=>card.shadowRoot.querySelector('.'+key+' .icon svg')));
 await page.evaluate(()=>{states['sensor.a_soc'].state='0';states['sensor.b_soc'].state='25';states['sensor.main_soc'].state='100';refresh()});
 const batteryLevels=await page.evaluate(()=>['auxiliary_1','auxiliary_2','main'].map(key=>{
  const svg=card.shadowRoot.querySelector('.'+key+' .icon svg'),fill=svg.querySelector('.battery-fill');
  return{charge:card.shadowRoot.querySelector('.'+key+' .soc .value').textContent,height:fill.getBBox().height,bottom:fill.y.baseVal.value+fill.height.baseVal.value,unknown:getComputedStyle(svg.querySelector('.battery-unknown')).display!=='none'};
 }));
 assert.deepEqual(batteryLevels,[{charge:'0%',height:0,bottom:52,unknown:false},{charge:'25%',height:8.25,bottom:52,unknown:false},{charge:'100%',height:33,bottom:52,unknown:false}]);
 await page.evaluate(()=>{states['sensor.a_soc'].state='80';states['sensor.b_soc'].state='unavailable';states['sensor.main_soc'].state='0';refresh()});
 assert(Math.abs(await page.evaluate(()=>card.shadowRoot.querySelector('.auxiliary_1 .battery-fill').getBBox().height)-26.4)<.001);
 assert(await page.evaluate(old=>old.every((svg,index)=>svg===card.shadowRoot.querySelector('.'+['auxiliary_1','auxiliary_2','main'][index]+' .icon svg')),batteries));
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.auxiliary_2 .battery-unknown')).display),'inline');
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.auxiliary_2 .soc .value').textContent),'—');
 await page.evaluate(()=>{states['sensor.a_soc'].state='-1';states['sensor.b_soc'].state='101';states['sensor.main_soc'].state='unknown';refresh()});
 assert(await page.evaluate(()=>['auxiliary_1','auxiliary_2','main'].every(key=>card.shadowRoot.querySelector('.'+key+' .soc .value').textContent==='—'&&card.shadowRoot.querySelector('.'+key+' .battery-fill').getBBox().height===0&&getComputedStyle(card.shadowRoot.querySelector('.'+key+' .battery-unknown')).display!=='none')));
 await page.evaluate(()=>{states['sensor.a_soc'].state='68';states['sensor.b_soc'].state='81';states['sensor.main_soc'].state='74';const {soc,...main}=config.main;card.setConfig({...config,main});refresh()});
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.main .battery-unknown')).display),'inline');
 await page.evaluate(()=>{card.setConfig(config);refresh()});
 // Nodes let the theme show through, including a gradient card background.
 const backgrounds=[];
 for(const background of ['#182536','#edf3fa','linear-gradient(135deg, #eadced, #b7d7f2)']){
  await page.evaluate(background=>card.style.setProperty('--ha-card-background',background),background);
  const theme=await page.evaluate(()=>({card:getComputedStyle(card.shadowRoot.querySelector('ha-card')).backgroundImage,nodes:[...card.shadowRoot.querySelectorAll('.node')].map(node=>getComputedStyle(node).backgroundColor)}));
  for(const color of theme.nodes){const alpha=Number(color.match(/(?:\/|,)\s*([\d.]+)\)$/)?.[1]);assert(alpha>=0&&alpha<=.1,`Opaque node background: ${color}`)}
  if(background.startsWith('linear-gradient'))assert(theme.card.startsWith('linear-gradient('));
  backgrounds.push(theme.nodes[0]);
 }
 assert.notEqual(backgrounds[0],backgrounds[1]);
 await page.evaluate(()=>card.style.removeProperty('--ha-card-background'));
 const motion=await page.evaluateHandle(()=>card.shadowRoot.querySelector('.flow-dashes'));
 await page.evaluate(()=>{states['sensor.unrelated']={state:'12',attributes:{}};refresh()});
 assert(await page.evaluate(old=>old===card.shadowRoot.querySelector('.flow-dashes'),motion));
 await page.evaluate(()=>{states['sensor.main_out'].state='0';states['binary_sensor.source'].state='on';states['binary_sensor.grid_available'].state='on';states['sensor.grid'].state='800';states['sensor.a_in'].state='200';states['sensor.b_in'].state='180';states['sensor.main_ac'].state='100';refresh()});
 assert.deepEqual(await page.evaluate(()=>active()),['auxiliary_1_main','auxiliary_2_main','grid_auxiliary_1','grid_auxiliary_2','grid_home','grid_main']);
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='unavailable';refresh()});
 assert((await page.evaluate(()=>active())).includes('grid_home'));
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='on';states['sensor.main_ac'].state='unavailable';states['sensor.main_pv'].state='unavailable';states['sensor.a_in'].state='unknown';refresh()});
 assert(!(await page.evaluate(()=>active())).includes('grid_main'));
 assert(!(await page.evaluate(()=>active())).includes('grid_auxiliary_1'));
 assert((await page.evaluate(()=>active())).includes('auxiliary_1_main'));
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .ac .value').textContent),'—');
 await page.evaluate(()=>{states['sensor.main_ac'].state='3';refresh()});
 assert(!(await page.evaluate(()=>active())).includes('grid_main'));
 await page.evaluate(()=>{states['sensor.main_ac'].state='3.1';refresh()});
 assert((await page.evaluate(()=>active())).includes('grid_main'));
 await page.evaluate(()=>{delete config.main.input_power;card.setConfig(config);states['sensor.main_ac'].state='100';states['sensor.main_pv'].state='200';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .input .value').textContent),'300 W');
 await page.evaluate(()=>{states['sensor.main_pv'].attributes.unit_of_measurement='Wh';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .solar_1 .value').textContent),'—');
 await page.evaluate(()=>{window.more=null;card.addEventListener('hass-more-info',e=>window.more=e.detail.entityId);card.shadowRoot.querySelector('.main .output .value').click()});
 assert.equal(await page.evaluate(()=>more),'sensor.main_out');
 const result=await page.evaluate(async()=>{
  const editor=await customElements.get('suris-ecoflow-flow-card').getConfigElement();editor.setConfig(config);editor.hass={states};document.body.append(editor);
  const forms=[...editor.shadowRoot.querySelectorAll('ha-form')];
  if(forms[4].computeLabel({name:'solar_input_power'})!=='Потужність входу XT60(1) (DC)'||forms[4].computeLabel({name:'solar_input_power_2'})!=='Потужність входу XT60(2) (DC)'||forms[5].computeLabel({name:'power'})!=='Вхід дому (необов’язково)')throw new Error('Outdated visual editor labels');
  const events=[];editor.addEventListener('config-changed',e=>events.push(e.detail.config));
  forms[5].dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...forms[5].data,power:'sensor.new_home'}},bubbles:true,composed:true}));
  forms[2].dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...forms[2].data,transfer_power:'sensor.a_dc'}},bubbles:true,composed:true}));
  forms[4].dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...forms[4].data,solar_input_power_2:'sensor.pv2'}},bubbles:true,composed:true}));
  forms[6].dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...forms[6].data,auxiliary_2_color:'#ff8800'}},bubbles:true,composed:true}));
  editor.setConfig(events.at(-1));
  const stable=editor.shadowRoot.querySelector('ha-form')===forms[0];
  const final=events.at(-1);if(forms[5].schema.some(field=>field.name==='source_entity'))throw new Error('Legacy source control remains');editor.remove();
  return{count:forms.length,events:events.length,home:final.home.power,transfer:final.auxiliary_1.transfer_power,solar2:final.main.solar_input_power_2,color3:final.appearance.auxiliary_2_color,stable};
 });
 assert.deepEqual(result,{count:7,events:4,home:'sensor.new_home',transfer:'sensor.a_dc',solar2:'sensor.pv2',color3:'#ff8800',stable:true});
 // Exercise real keystrokes and the parent configuration feedback used by Home Assistant.
 await page.evaluate(async()=>{
  window.editor=await customElements.get('suris-ecoflow-flow-card').getConfigElement();editor.hass={states};editor.setConfig(config);document.body.append(editor);
  for(const details of editor.shadowRoot.querySelectorAll('details'))details.open=true;
  window.originalForms=[...editor.shadowRoot.querySelectorAll('ha-form')];window.originalInputs=originalForms.flatMap(form=>[...form.shadowRoot.querySelectorAll('input')]);window.originalNodes=[...card.shadowRoot.querySelectorAll('.node')];window.published=[];window.feedbackErrors=[];
  editor.addEventListener('config-changed',event=>{try{card.setConfig(event.detail.config);const roundtrip=JSON.parse(JSON.stringify(event.detail.config));published.push(roundtrip);editor.setConfig(roundtrip)}catch(error){feedbackErrors.push(error.message)}});
 });
 const sections=['','grid','auxiliary_1','auxiliary_2','main','home','appearance'];
 const field=(section,name)=>page.locator('suris-ecoflow-flow-card-editor ha-form').nth(sections.indexOf(section)).locator(`input[data-field="${name}"]`);
 const assertEditorStable=async()=>{
  assert.deepEqual(await page.evaluate(()=>feedbackErrors),[]);
  assert(await page.evaluate(()=>originalForms.every((form,index)=>editor.shadowRoot.querySelectorAll('ha-form')[index]===form)&&originalInputs.every(input=>input.isConnected)&&[...editor.shadowRoot.querySelectorAll('details')].every(details=>details.open)&&originalNodes.every((node,index)=>card.shadowRoot.querySelectorAll('.node')[index]===node)),'Editing replaced fields or preview nodes');
 };
 for(const [section,name,value]of [['','title','Потоки'],['grid','name','Місто'],['grid','available_state','on'],['auxiliary_1','name','Рівер 2'],['auxiliary_2','name','Рівер 3'],['main','name','Дельта'],['home','name','Квартира'],['main','solar_input_power_2','sensor.pv2'],['appearance','threshold','7'],['appearance','duration','4']]){
  const input=field(section,name);await input.fill('');assert.equal(await input.inputValue(),'');assert(await input.evaluate(input=>input.getRootNode().activeElement===input));await assertEditorStable();
  await input.pressSequentially(value,{delay:5});assert.equal(await input.inputValue(),value);await assertEditorStable();
 }
 const title=field('','title');await title.fill('abc');await title.press('Home');await title.press('ArrowRight');await title.pressSequentially('X');assert.equal(await title.inputValue(),'aXbc');assert.equal(await title.evaluate(input=>input.selectionStart),2);await assertEditorStable();
 for(const name of ['grid_color','auxiliary_1_color','auxiliary_2_color','main_color']){
  const input=field('appearance',name);
  for(const value of ['', 'r', 're', 'red', '', '#', '#f', '#ff', '#ff0', '#ff00', '#ff000', '#ff0000']){await input.fill(value);assert.equal(await input.inputValue(),value);await assertEditorStable()}
  await input.fill('');await input.pressSequentially('green',{delay:5});assert.equal(await input.inputValue(),'green');await assertEditorStable();
 }
 const mainColor=field('appearance','main_color');
 for(const [color,expected]of [['red','rgb(255, 0, 0)'],['green','rgb(0, 128, 0)'],['orange','rgb(255, 165, 0)'],['#f00','rgb(255, 0, 0)'],['rgb(0, 128, 255)','rgb(0, 128, 255)'],['hsl(120, 100%, 25%)','rgb(0, 128, 0)']]){
  await mainColor.fill(color);assert.deepEqual(await page.evaluate(()=>({border:getComputedStyle((card._nodes.main.classList.contains('supplying')?card._borders.main.firstElementChild:card._nodes.main)).getPropertyValue(card._nodes.main.classList.contains('supplying')?'stroke':'border-top-color'),flow:getComputedStyle(card.shadowRoot.querySelector('[data-flow="main_home"] .flow-dashes')).stroke})),{border:expected,flow:expected});await assertEditorStable();
 }
 for(const color of ['#f008','#ff000080','rgba(255, 0, 0, 0.5)','hsla(120, 100%, 25%, 0.5)','lightseagreen']){await mainColor.fill(color);assert.equal(await page.evaluate(()=>published.at(-1).appearance.main_color),color);await assertEditorStable()}
 const beforeDraft=await page.evaluate(()=>published.length);await mainColor.fill('#');assert.equal(await page.evaluate(()=>published.length),beforeDraft);
 await page.evaluate(()=>editor.setConfig(published.at(-1)));assert.equal(await mainColor.inputValue(),'#');await field('main','name').fill('Нова назва');assert.equal(await page.evaluate(()=>published.length),beforeDraft);
 await mainColor.fill('red');assert.equal(await page.evaluate(()=>published.at(-1).main.name),'Нова назва');await assertEditorStable();
 const duration=field('appearance','duration');const beforeNumber=await page.evaluate(()=>published.length);await duration.fill('-');assert.equal(await duration.inputValue(),'-');assert.equal(await page.evaluate(()=>published.length),beforeNumber);await duration.fill('0');assert.equal(await page.evaluate(()=>published.length),beforeNumber);await duration.fill('0.5');assert.equal(await page.evaluate(()=>card._config.appearance.duration),.5);
 await duration.fill('');assert.equal(await duration.inputValue(),'');assert.equal(await page.evaluate(()=>card._config.appearance.duration),3);await assertEditorStable();
 await mainColor.fill('');assert.equal(await mainColor.inputValue(),'');assert.equal(await page.evaluate(()=>getComputedStyle((card._nodes.main.classList.contains('supplying')?card._borders.main.firstElementChild:card._nodes.main)).getPropertyValue(card._nodes.main.classList.contains('supplying')?'stroke':'border-top-color')),'rgb(39, 217, 213)');
 await field('appearance','main_color').fill('red');await field('','language').fill('en');
 assert(await page.evaluate(()=>[...editor.shadowRoot.querySelectorAll('details')].every(details=>details.open)));
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .solar_2 .label').textContent),'XT60(2)');
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .label').textContent),'Input');
 await page.evaluate(async()=>{const saved=published.at(-1);editor.remove();window.editor=await customElements.get('suris-ecoflow-flow-card').getConfigElement();editor.hass={states};editor.setConfig(saved);document.body.append(editor);for(const details of editor.shadowRoot.querySelectorAll('details'))details.open=true});
 assert.equal(await field('main','name').inputValue(),'Нова назва');assert.equal(await field('appearance','main_color').inputValue(),'red');assert.equal(await field('main','solar_input_power_2').inputValue(),'sensor.pv2');
 assert.equal(await field('home','source_mode').count(),0);
 await page.evaluate(()=>{editor.remove();card.setConfig(config);refresh()});
 await page.evaluate(()=>{delete config.home.power;states['binary_sensor.source'].state='on';states['binary_sensor.grid_available'].state='on';states['sensor.grid'].state='1000';states['sensor.a_in'].state='100';states['sensor.b_in'].state='200';states['sensor.main_ac'].state='300';card.setConfig(config);refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'400 W');
 assert((await page.evaluate(()=>active())).includes('grid_home'));
 assert(!(await page.evaluate(()=>active())).includes('main_home'));
 await page.evaluate(()=>{states['sensor.b_in'].state='unavailable';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'600 W');
 assert((await page.evaluate(()=>active())).includes('grid_home'));
 await page.evaluate(()=>{states['sensor.a_in'].state='unavailable';states['sensor.main_ac'].state='unavailable';states['sensor.grid'].state='285';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'285 W');
 assert((await page.evaluate(()=>active())).includes('grid_home'));
 assert(!(await page.evaluate(()=>active())).includes('main_home'));
 await page.evaluate(()=>{states['sensor.a_in'].state='50';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'235 W');
 await page.evaluate(()=>{states['sensor.main_out'].state='320';states['binary_sensor.grid_available'].state='off';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'320 W');
 assert((await page.evaluate(()=>active())).includes('main_home'));
 await page.evaluate(()=>{config.home.power='sensor.home';card.setConfig(config);refresh()});
 await page.evaluate(()=>{
  config.main.solar_input_power_2='sensor.pv2';states['sensor.main_ac'].state='100';states['sensor.main_pv'].state='200';states['sensor.main_pv'].attributes.unit_of_measurement='W';states['sensor.pv2']={state:'150',attributes:{unit_of_measurement:'W'}};
  config.appearance={grid_color:'#1166cc',main_color:'#22cc88',auxiliary_1_color:'#aa44dd',auxiliary_2_color:'#ff8800'};states['sensor.a_out'].state='0';states['sensor.b_out'].state='350';card.setConfig(config);refresh();
 });
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .input .value').textContent),'450 W');
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .solar_1 .value').textContent),'200 W');
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .solar_2 .value').textContent),'150 W');
 assert((await page.evaluate(()=>active())).includes('auxiliary_2_main'));assert(!(await page.evaluate(()=>active())).includes('auxiliary_1_main'));
 const colors=await page.evaluate(()=>{
  const border=key=>getComputedStyle((card._nodes[key].classList.contains('supplying')?card._borders[key].firstElementChild:card._nodes[key])).getPropertyValue(card._nodes[key].classList.contains('supplying')?'stroke':'border-top-color');
  const flow=name=>getComputedStyle(card.shadowRoot.querySelector('[data-flow="'+name+'"] .flow-dashes')).stroke;
  return{grid:[border('grid'),flow('grid_main'),flow('grid_home')],main:[border('main'),flow('main_home'),border('home')],a:[border('auxiliary_1'),flow('auxiliary_1_main')],b:[border('auxiliary_2'),flow('auxiliary_2_main')]};
 });
 assert.deepEqual(colors,{grid:['rgb(17, 102, 204)','rgb(17, 102, 204)','rgb(17, 102, 204)'],main:['rgb(34, 204, 136)','rgb(34, 204, 136)','rgb(34, 204, 136)'],a:['rgb(170, 68, 221)','rgb(170, 68, 221)'],b:['rgb(255, 136, 0)','rgb(255, 136, 0)']});
 await page.evaluate(()=>{card.shadowRoot.querySelector('.main .solar_2 .value').click()});assert.equal(await page.evaluate(()=>more),'sensor.pv2');
 await page.evaluate(()=>{states['sensor.main_pv'].state='unavailable';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .input .value').textContent),'—');
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .solar_2 .value').textContent),'150 W');assert((await page.evaluate(()=>active())).includes('auxiliary_2_main'));
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='on';refresh()});
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.home')).borderTopColor),'rgb(34, 204, 136)');
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='unavailable';refresh()});
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.home')).borderTopColor),'rgb(34, 204, 136)');
 // Home output detection remains independent of the optional grid outage indicator.
 await page.evaluate(()=>{card.setConfig({...config,home:{...config.home,source_mode:'grid'}});refresh()});
 assert((await page.evaluate(()=>active())).includes('main_home'));assert(!(await page.evaluate(()=>active())).includes('grid_home'));
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.status').textContent),'');
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.grid-outage').hidden),true);
 const flowsBeforeIndicator=await page.evaluate(()=>active());
 for(const state of ['on','off','unknown','unexpected','unavailable','']){
  await page.evaluate(state=>{states['binary_sensor.grid_available'].state=state;refresh()},state);
  assert((await page.evaluate(()=>active())).includes('main_home'));assert(!(await page.evaluate(()=>active())).includes('grid_home'));
  assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.grid-outage').hidden),state!=='off');
  assert.equal(await page.evaluate(()=>getComputedStyle(card._values['grid.output'].parentElement).display),state==='off'?'none':'flex','Hide the grid output row only during a confirmed outage');
  assert.deepEqual(await page.evaluate(()=>active()),flowsBeforeIndicator);
 }
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='off';refresh()});
 const outage=await page.evaluate(()=>{const node=card.shadowRoot.querySelector('.grid-outage'),style=getComputedStyle(node);return{text:node.textContent,color:style.color,animation:style.animationName,icon:getComputedStyle(card.shadowRoot.querySelector('.grid .icon svg')).visibility}});
 assert.deepEqual(outage,{text:'Мережі немає',color:'rgb(255, 59, 48)',animation:'grid-outage-pulse',icon:'hidden'});
 for(const width of [320,390,540,768,1150]){
  await page.setViewportSize({width,height:900});
  const fits=await page.evaluate(()=>{const node=card.shadowRoot.querySelector('.grid-outage'),icon=node.parentElement.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(node);const text=range.getBoundingClientRect();return text.left>=icon.left-.5&&text.right<=icon.right+.5&&text.top>=icon.top-.5&&text.bottom<=icon.bottom+.5});
  assert(fits,`Outage text does not fit at ${width}px`);
 }
 await page.setViewportSize({width:390,height:900});
 await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-grid-outage.png')});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.grid-outage')).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1150,height:900});
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='on';states['sensor.main_out'].state='0';refresh()});
 assert((await page.evaluate(()=>active())).includes('grid_home'));assert(!(await page.evaluate(()=>active())).includes('main_home'));
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.grid-outage').hidden),true);
 const gridFlowsBeforeIndicator=await page.evaluate(()=>active());
 for(const state of ['off','unknown','unexpected','unavailable','']){
  await page.evaluate(state=>{states['binary_sensor.grid_available'].state=state;refresh()},state);
  assert.deepEqual(await page.evaluate(()=>active()),gridFlowsBeforeIndicator);
 }
 await page.evaluate(()=>{states['sensor.main_out'].state='unavailable';refresh()});
 assert(!(await page.evaluate(()=>active())).includes('main_home'));assert((await page.evaluate(()=>active())).includes('grid_home'));
 await page.evaluate(()=>{states['sensor.main_out'].state='320';card.setConfig({...config,grid:{...config.grid,available_entity:''},home:{...config.home,source_mode:'grid'}});refresh()});
 assert((await page.evaluate(()=>active())).includes('main_home'));assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.grid-outage').hidden),true);
 await page.evaluate(()=>{card.setConfig({...config,language:'en',home:{...config.home,source_mode:'grid'}});states['binary_sensor.grid_available'].state='off';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.grid-outage').textContent),'No grid');
 await page.evaluate(()=>{states['binary_sensor.grid_available'].state='unavailable';card.setConfig(config);refresh()});
 console.log('PASS: independent main-output source detection, optional sensor, exclusive home flows, pulsing red outage label, mobile text fitting, language and reduced motion.');
 const invalid=await page.evaluate(()=>{
  try{card.setConfig({...config,appearance:{...config.appearance,threshold:-1}});return false}catch{return true}
 });assert(invalid);
 await page.evaluate(()=>{states['sensor.main_pv'].attributes.unit_of_measurement='W';states['binary_sensor.source'].state='off';states['binary_sensor.grid_available'].state='off';states['sensor.a_in'].state='0';states['sensor.b_in'].state='0';states['sensor.a_out'].state='100';states['sensor.b_out'].state='0';states['sensor.main_ac'].state='0';states['sensor.main_pv'].state='100';states['sensor.pv2'].state='0';states['sensor.main_out'].state='449';states['sensor.home'].state='449';states['sensor.grid'].state='0';config.auxiliary_1.name='Delta';config.auxiliary_2.name='River';config.main.name='Delta 2';config.appearance={...config.appearance,grid_color:'blue',auxiliary_1_color:'green',auxiliary_2_color:'orange',main_color:'red'};card.setConfig(config);refresh()});
 await verifyRoutes('updated desktop');
 await verifyBorders('main supplies home');
 await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-desktop.png')});
 await page.setViewportSize({width:390,height:800});
 await page.evaluate(()=>{document.body.style.margin='8px';for(const [name,value]of Object.entries({'--ha-card-background':'linear-gradient(135deg, #ece7f2, #b9d9ed)','--primary-text-color':'#172239','--secondary-text-color':'#4d5666','--divider-color':'#888d9b'}))card.style.setProperty(name,value)});
 await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .source')),null);
 await page.evaluate(()=>{window.layoutStates=JSON.parse(JSON.stringify(states));states['binary_sensor.grid_available'].state='on';refresh()});
 for(const language of ['uk','en']){
  await page.evaluate(language=>{card.setConfig({...config,language});refresh()},language);
  for(const [watts,expected] of [[999,'999 W'],[1000,'1 kW'],[2468,language==='uk'?'2,47 kW':'2.47 kW'],[12345,language==='uk'?'12,35 kW':'12.35 kW'],[99999,'100 kW']]){
   await page.evaluate(watts=>{states['sensor.grid'].state=String(watts);refresh()},watts);
   await verifyBorders(`${language}: ${watts} W`);
   assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.grid .value').textContent),expected);
   for(const width of [320,352,390,422]){
    await page.setViewportSize({width,height:800});
    await page.waitForTimeout(60);
    assert(await page.evaluate(()=>Math.abs(card._nodes.grid.getBoundingClientRect().width-card._nodes.home.getBoundingClientRect().width)<.1),'Grid and home widths must match');
    const fit=await page.evaluate(()=>{const row=card.shadowRoot.querySelector('.grid .row'),v=row.querySelector('.value'),range=document.createRange();range.selectNodeContents(v);const bounds=range.getBoundingClientRect(),label=row.querySelector('.label');range.selectNodeContents(label);const caption=range.getBoundingClientRect();return {available:row.getBoundingClientRect().width,needed:bounds.width+caption.width+parseFloat(getComputedStyle(row).columnGap),height:bounds.height,lineHeight:parseFloat(getComputedStyle(v).lineHeight),sameLine:Math.abs(bounds.bottom-caption.bottom)<2}});
    assert(fit.needed<=fit.available+.5,`${language}: ${expected} too wide at ${width}px: ${JSON.stringify(fit)}`);
    assert(fit.height<=fit.lineHeight+1&&fit.sameLine,`Wrapped grid output row at ${width}px: ${JSON.stringify(fit)}`);
    await page.evaluate(watts=>{for(const id of ['sensor.a_in','sensor.a_out','sensor.b_in','sensor.b_out','sensor.main_in','sensor.main_ac','sensor.main_pv','sensor.pv2','sensor.main_out','sensor.home']){states[id].state=String(watts);states[id].attributes.unit_of_measurement='W'}refresh()},watts);
    const rows=await page.evaluate(()=>[...card.shadowRoot.querySelectorAll('.row:not([hidden])')].map(row=>{const range=document.createRange();range.selectNodeContents(row.querySelector('.label'));const label=range.getBoundingClientRect();range.selectNodeContents(row.querySelector('.value'));const value=range.getBoundingClientRect();return {key:row.parentElement.dataset.key+'.'+row.className,text:row.textContent,available:row.clientWidth,needed:label.width+value.width+parseFloat(getComputedStyle(row).columnGap),sameLine:Math.abs(label.bottom-value.bottom)<2}}));
    for(const row of rows){assert(row.needed<=row.available+.5,`${language}, ${width}px: overflow ${JSON.stringify(row)}`);assert(row.sameLine,`${language}, ${width}px: wrapped ${JSON.stringify(row)}`)}
    if(language==='uk'&&watts===2468&&width===390){
     await page.evaluate(()=>{states['sensor.a_in'].state='999';states['sensor.a_out'].state='100';states['sensor.b_in'].state='111';states['sensor.b_out'].state='999';states['sensor.main_in'].state='184';states['sensor.main_ac'].state='185';states['sensor.main_pv'].state='0';states['sensor.pv2'].state='0';states['sensor.main_out'].state='0';states['sensor.home'].state='216';states['binary_sensor.grid_available'].state='on';refresh()});
     await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-mobile.png')});
    }
   }
  }
 }
 await page.setViewportSize({width:390,height:800});
 await page.evaluate(()=>{states=layoutStates;states['sensor.grid'].state='0';card.setConfig(config);refresh()});
 const layout=await page.evaluate(()=>{
  const d=card.shadowRoot.querySelector('.diagram').getBoundingClientRect();const nodes=[...card.shadowRoot.querySelectorAll('.node')];
  return{overflows:nodes.filter(n=>n.scrollWidth>n.clientWidth+1 || n.scrollHeight>n.clientHeight+1).map(n=>n.dataset.key),outside:nodes.filter(n=>{const r=n.getBoundingClientRect();return r.left<d.left-.1||r.right>d.right+.1||r.top<d.top-.1||r.bottom>d.bottom+.1}).map(n=>n.dataset.key),rects:nodes.map(n=>({key:n.dataset.key,rect:n.getBoundingClientRect().toJSON()}))};
 });
 assert.deepEqual(layout.overflows,[]);assert.deepEqual(layout.outside,[]);
 for(let i=0;i<layout.rects.length;i++)for(let j=i+1;j<layout.rects.length;j++){const a=layout.rects[i].rect,b=layout.rects[j].rect;assert(!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top),`Overlapping nodes ${layout.rects[i].key}, ${layout.rects[j].key}`)}
 await verifyRoutes('mobile');
 await verifyBorders('mobile outlines');
 for (const width of [320, 768]) {
  await page.setViewportSize({width,height:900});await page.waitForTimeout(60);
  const problems=await page.evaluate(()=>[...card.shadowRoot.querySelectorAll('.node')].filter(n=>n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1).map(n=>n.dataset.key));
  assert.deepEqual(problems,[],`Content overflow at ${width}px`);
  await verifyRoutes(`${width}px`);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>Object.values(card._flows).every(flow=>flow._animation.playState==='paused')&&Object.values(card._borders).every(border=>border._animation.playState==='paused'));
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.flow-dashes')).display),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.waitForFunction(()=>card._flows.main_home._animation.playState==='running'&&card._borders.main._animation.playState==='running');
 await page.evaluate(()=>card.remove());assert(await page.evaluate(()=>Object.values(card._flows).every(flow=>flow._animation.playState==='paused')&&Object.values(card._borders).every(border=>border._animation.playState==='paused')));
 await page.evaluate(()=>document.querySelector('#host').append(card));await page.waitForFunction(()=>card._flows.main_home._animation.playState==='running'&&card._borders.main._animation.playState==='running');
 await page.evaluate(()=>{const card2=document.createElement('suris-ecoflow-flow-card');card2.setConfig({type:'custom:suris-ecoflow-flow-card'});document.body.append(card2)});
 assert.deepEqual(errors,[]);
 console.log('PASS: clockwise supplying outlines, continuous wattage-dependent outline speed, source switching, seven orthogonal flows, correct endpoints, matching dash paths and wattage-dependent speed, straight first-station transfer, one-corner home feed, unavailable data, kW conversion, unsupported units, threshold, XT60 labels, independent battery charge levels, unavailable charge, transparent light/dark/gradient themes, home input without approximation symbol, named/HEX/RGB/HSL colors, total input, editor clearing and typing, focus and cursor, draft validation, configuration feedback, saved selections, stable preview, more-info, all rows on one line at mobile widths, W/kW in both languages, mobile bounds, reduced motion, empty configuration.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
