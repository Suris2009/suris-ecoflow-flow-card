const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
 const browser = await chromium.launch({headless:true,...(process.env.SURIS_CHROMIUM_PATH ? {executablePath:process.env.SURIS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']} : {})});
 const page = await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setContent('<html><body style="margin:8px;background:#ddd;font-family:Arial"><div id="host"></div></body></html>');
 await page.addScriptTag({path:path.join(root,'suris-ecoflow-flow-card.js')});
 await page.evaluate(()=>{
  customElements.define('ha-form',class extends HTMLElement{
   constructor(){super();this.attachShadow({mode:'open'});this.inputs=new Map()}
   set schema(fields){this.fields=fields;this.shadowRoot.innerHTML='';this.inputs.clear();for(const field of fields){const input=document.createElement('input');input.dataset.field=field.name;input.setAttribute('aria-label',field.name);input.addEventListener('input',()=>{this._data={...this._data,[field.name]:input.value};this.dispatchEvent(new CustomEvent('value-changed',{detail:{value:this._data},bubbles:true,composed:true}))});this.inputs.set(field.name,input);this.shadowRoot.append(input)}}
   get schema(){return this.fields}
   set data(value){this._data=value;for(const [name,input]of this.inputs){const text=String(value?.[name]??'');if(input.value!==text)input.value=text}}
   get data(){return this._data}
  });
  const state=(value,unit='W')=>({state:String(value),attributes:{unit_of_measurement:unit}});
  window.states={'sensor.grid':state(2500),'binary_sensor.grid':state('on'),'sensor.a_soc':state(68,'%'),'sensor.b_soc':state(81,'%'),'sensor.m_soc':state(74,'%'),'sensor.a_in':state(100),'sensor.a_out':state(0),'sensor.b_in':state(100),'sensor.b_out':state(0),'sensor.m_ac':state(200),'sensor.m_pv':state(0),'sensor.m_pv2':state(0),'sensor.m_out':state(0)};
  window.config={type:'custom:suris-ecoflow-flow-card',grid:{power:'sensor.grid',available_entity:'binary_sensor.grid'},auxiliary_1:{name:'Delta Max',soc:'sensor.a_soc',input_power:'sensor.a_in',output_power:'sensor.a_out'},auxiliary_2:{name:'River Max',soc:'sensor.b_soc',input_power:'sensor.b_in',output_power:'sensor.b_out'},main:{name:'Delta 2 Max',soc:'sensor.m_soc',ac_input_power:'sensor.m_ac',solar_input_power:'sensor.m_pv',solar_input_power_2:'sensor.m_pv2',output_power:'sensor.m_out'},consumers:[],appearance:{grid_color:'#2996ff',auxiliary_1_color:'green',auxiliary_2_color:'orange',main_color:'#e22'}};
  window.card=document.createElement('suris-ecoflow-flow-card');card.setConfig(config);card.hass={states};document.querySelector('#host').append(card);
  for(const [name,value]of Object.entries({'--ha-card-background':'linear-gradient(135deg, #ece7f2, #b9d9ed)','--primary-text-color':'#172239','--secondary-text-color':'#4d5666','--divider-color':'#888d9b'}))card.style.setProperty(name,value);
  window.refresh=()=>{card.hass={states:{...states}}};
  window.visibleIds=()=>[...card._consumerNodes.keys()].sort();
  window.makeConsumers=()=>{const names=['Бойлер','Чайник','Пральна','Холодильник','Освітлення','Розетки'];const icons=['mdi:water-boiler','mdi:kettle','mdi:washing-machine','mdi:fridge','mdi:lightbulb','mdi:power-socket-eu'];const colors=['#ec5565','#d89400','#835ed6','#179ba1','#1c9f5c','#5478d6'];return Array.from({length:20},(_,i)=>({id:`load_${i}`,name:names[i]||`Прилад ${i+1}`,power:`sensor.load_${i}`,icon:icons[i]||'mdi:power-plug',color:colors[i]||'#4b9fff'}))};
 });
 await page.evaluate(()=>{states['sensor.home_voltage']={state:'229.6',attributes:{unit_of_measurement:'V'}};config.home={voltage:'sensor.home_voltage'};card.setConfig(config);refresh()});
 assert.equal(await page.evaluate(()=>card._values['home.voltage'].textContent),'230 V');
 assert.equal(await page.evaluate(()=>getComputedStyle(card._nodes.home).borderTopWidth),'3px');
 await page.evaluate(()=>{states['sensor.home_voltage'].state='unavailable';refresh()});
 assert.equal(await page.evaluate(()=>card._values['home.voltage'].textContent),'—');
 await page.evaluate(()=>{delete config.home.voltage;card.setConfig(config)});
 assert(await page.evaluate(()=>card._values['home.voltage'].parentElement.hidden));
 await page.evaluate(()=>{config.home.voltage='sensor.home_voltage';states['sensor.home_voltage'].state='229.6';card.setConfig(config);refresh()});
 const baselineHeight=await page.locator('suris-ecoflow-flow-card').evaluate(card=>card.getBoundingClientRect().height);
 await page.evaluate(()=>{config.consumers=makeConsumers();for(let i=0;i<20;i++)states[`sensor.load_${i}`]={state:String(600-i*25),attributes:{unit_of_measurement:'W'}};card.setConfig(config);refresh()});
 assert.deepEqual(await page.evaluate(()=>visibleIds()),['load_0','load_1','load_2','load_3','load_4','load_5']);
 assert.equal(await page.locator('suris-ecoflow-flow-card').evaluate(card=>card.getBoundingClientRect().height),baselineHeight+186);
 const verifyLayout=async label=>{
  const result=await page.evaluate(()=>{
   const d=card._diagram.getBoundingClientRect(),all=[...card.shadowRoot.querySelectorAll('.node')];
   const bounds=node=>{const r=node.getBoundingClientRect();return{x:r.left-d.left,y:r.top-d.top,right:r.right-d.left,bottom:r.bottom-d.top,w:r.width,h:r.height,slot:Number(node.dataset.slot)}};
   const nodes=Object.fromEntries(all.map(node=>[node.dataset.key,bounds(node)]));
   const paths=Object.entries(card._flows).map(([name,flow])=>{const path=flow.querySelector('.flow-track'),length=path.getTotalLength();return{name,d:path.getAttribute('d'),points:Array.from({length:Math.ceil(length/2)+1},(_,i)=>{const p=path.getPointAtLength(Math.min(length,i*2));return{x:p.x,y:p.y}}),start:path.getPointAtLength(0).toJSON?.()||{x:path.getPointAtLength(0).x,y:path.getPointAtLength(0).y},end:{x:path.getPointAtLength(length).x,y:path.getPointAtLength(length).y},color:getComputedStyle(flow.querySelector('.flow-dashes')).stroke}});
   const overflow=all.filter(node=>node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1).map(node=>node.dataset.key);
   return{height:d.height,width:d.width,nodes,paths,overflow};
  });
  const consumerCount=Object.keys(result.nodes).filter(key=>key.startsWith('consumer:')).length;assert.equal(result.paths.length,7+consumerCount+Math.ceil(consumerCount/3),`${label}: shared row route count`);assert.deepEqual(result.overflow,[],`${label}: overflow`);
  for(const [key,n]of Object.entries(result.nodes)){assert(n.x>=-.1&&n.y>=-.1&&n.right<=result.width+.1&&n.bottom<=result.height+.1,`${label}: outside ${key}`)}
  const nodes=Object.entries(result.nodes);for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const [ka,a]=nodes[i],[kb,b]=nodes[j];assert(!(a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y),`${label}: ${ka} overlaps ${kb}`)}
  const standard={grid_auxiliary_1:['grid','auxiliary_1'],grid_auxiliary_2:['grid','auxiliary_2'],grid_main:['grid','main'],grid_home:['grid','home'],auxiliary_1_main:['auxiliary_1','main'],auxiliary_2_main:['auxiliary_2','main'],main_home:['main','home']};
  const onBorder=(p,n)=>p.x>=n.x-.3&&p.x<=n.right+.3&&p.y>=n.y-.3&&p.y<=n.bottom+.3&&Math.min(Math.abs(p.x-n.x),Math.abs(p.x-n.right),Math.abs(p.y-n.y),Math.abs(p.y-n.bottom))<.3;
  for(const route of result.paths){
   assert((route.d.match(/[A-Za-z]/g)||[]).every(command=>['M','H','V'].includes(command)),`${label}: diagonal ${route.name}`);
   let source,target;
   if(standard[route.name]){[source,target]=standard[route.name];assert(onBorder(route.start,result.nodes[source])&&onBorder(route.end,result.nodes[target]),`${label}: wrong endpoints ${route.name}`)}
   else if(route.name.startsWith('home_row_')){source='home';assert(onBorder(route.start,result.nodes.home),`${label}: feeder must start on home`);assert.equal((route.d.match(/[HV]/g)||[]).length,2,`${label}: row feeder must have one turn`)}
   else{target='consumer:'+route.name.slice(14);const row=result.paths.find(p=>p.name==='home_row_'+(result.nodes[target].slot<3?'lower':'upper'));assert(onBorder(route.end,result.nodes[target]),`${label}: branch must end on consumer`);assert(Math.abs(route.start.y-row.end.y)<.2&&route.start.x>=row.end.x-.2&&route.start.x<=row.start.x+.2,`${label}: branch must start on shared row line`);assert.equal((route.d.match(/[HV]/g)||[]).length,1,`${label}: branch must be vertical`)}
   for(const p of route.points){assert(p.x>=-.3&&p.y>=-.3&&p.x<=result.width+.3&&p.y<=result.height+.3,`${label}: path outside ${route.name}`);for(const [key,n]of nodes)if(key!==source&&key!==target)assert(!(p.x>n.x+.3&&p.x<n.right-.3&&p.y>n.y+.3&&p.y<n.bottom-.3),`${label}: ${route.name} crosses ${key} at ${p.x},${p.y}`)}
  }

  const segments=route=>{const tokens=route.d.match(/[MHV]|-?\d+(?:\.\d+)?/g);let x=0,y=0,out=[];for(let i=0;i<tokens.length;){const command=tokens[i++],old={x,y};if(command==='M'){x=+tokens[i++];y=+tokens[i++]}else{if(command==='H')x=+tokens[i++];else y=+tokens[i++];out.push([old,{x,y}])}}return out};
  const charging=segments(result.paths.find(p=>p.name==='grid_auxiliary_2'));
  const lane=charging[2][0].y;
  assert(lane-result.nodes.home.bottom>=19.99,`${label}: station #3 charging too close below Home`);
  assert(lane<=result.nodes.auxiliary_2.y-.01,`${label}: station #3 charging must approach from above: ${JSON.stringify(result.nodes)}`);
  for(const name of ['grid_home','grid_main'])for(const [a,b]of charging)for(const [c,d]of segments(result.paths.find(p=>p.name===name))){
   const overlapX=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))-Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x));
   const overlapY=Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))-Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y));
   assert(!(overlapX>=-.01&&overlapY>=-.01),`${label}: station #3 charging intersects ${name}`);
  }
  assert(result.nodes.auxiliary_1.right<result.nodes.main.x&&result.nodes.main.right<result.nodes.auxiliary_2.x,`${label}: stations must flank main`);
 };
 for(const width of [320,352,390,422,540,768,1150]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(80);await verifyLayout(`${width}px`)}
 // Preserve one-line phone readings even with the longer historical home label.
 for(const width of [320,352,390,422]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(80);
  assert(await page.evaluate(()=>{const row=card._values['home.power'].parentElement,label=row.querySelector('.label');label.textContent='Споживання';card._values['home.power'].textContent='12,35 kW';card._fitRows();const a=label.getBoundingClientRect(),b=card._values['home.power'].getBoundingClientRect();return getComputedStyle(label).whiteSpace==='nowrap'&&a.right<=b.left+1&&b.right<=row.getBoundingClientRect().right+1}));
 }
 await page.evaluate(()=>{card._values['home.power'].parentElement.querySelector('.label').textContent='Вхід';refresh()});
 // Reproduce the two-line Home heading from the installed mobile dashboard.
 await page.evaluate(()=>{config.home.name='Споживання дому';card.setConfig(config);refresh()});
 for(const count of [0,3,6]){
  await page.evaluate(count=>{for(let i=0;i<20;i++)states[`sensor.load_${i}`].state=String(i<count?600-i*25:0);refresh()},count);
  for(const width of [320,352,390,422,540,768,1150]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(60);await verifyLayout(`${width}px long Home heading, ${count} consumers`)}
 }
 await page.evaluate(()=>{delete config.home.name;card.setConfig(config);refresh()});
 // Retained tiles and station animations survive a strongest-consumer replacement.
 await page.evaluate(()=>{window.retainedNode=card._consumerNodes.get('load_0');window.retainedAnimation=card._flows.grid_home._animation;window.previousOrder=[...card._consumerOrder];states['sensor.load_19'].state='2000';refresh()});
 assert.deepEqual(await page.evaluate(()=>visibleIds()),['load_0','load_1','load_19','load_2','load_3','load_4']);
 assert(await page.evaluate(()=>card._consumerNodes.get('load_0')===retainedNode&&card._flows.grid_home._animation===retainedAnimation));
 assert.equal(await page.evaluate(()=>card._consumerOrder[5]),'load_19');
 await page.evaluate(()=>{states['sensor.load_5'].state='2000';refresh()});assert((await page.evaluate(()=>visibleIds())).includes('load_19'),'Equal power must not evict an existing tile');
 for(const value of ['unavailable','unknown','0','-10','3']){await page.evaluate(value=>{states['sensor.load_19'].state=value;refresh()},value);assert(!(await page.evaluate(()=>visibleIds())).includes('load_19'))}
 await page.evaluate(()=>{states['sensor.load_19'].state='2';states['sensor.load_19'].attributes.unit_of_measurement='kW';refresh()});assert((await page.evaluate(()=>visibleIds())).includes('load_19'));
 await page.evaluate(()=>{states['sensor.load_19'].attributes.unit_of_measurement='kWh';refresh()});assert(!(await page.evaluate(()=>visibleIds())).includes('load_19'));
 // Device borders stay independent; both shared rows and branches use the home color.
 await page.evaluate(()=>{config.consumers[0].color='orange';card.setConfig(config);refresh()});
 const color=await page.evaluate(()=>({border:getComputedStyle(card._consumerNodes.get('load_0')).borderTopColor,line:getComputedStyle(card._flows.home_consumer_load_0.querySelector('.flow-dashes')).stroke}));assert.deepEqual(color,{border:'rgb(255, 165, 0)',line:'rgb(41, 150, 255)'});
 assert(await page.evaluate(()=>!card._nodes.home.classList.contains('supplying')&&getComputedStyle(card._nodes.home).borderTopStyle==='solid'&&card._borders.home._animation.playState==='paused'));
 await page.evaluate(()=>{states['binary_sensor.grid'].state='off';refresh()});
 assert(await page.evaluate(()=>Object.entries(card._flows).filter(([name])=>name.startsWith('home_')).every(([,flow])=>getComputedStyle(flow.querySelector('.flow-dashes')).stroke==='rgb(238, 34, 34)')));
 assert(await page.evaluate(()=>!card._nodes.home.classList.contains('supplying')));
 await page.evaluate(()=>{states['binary_sensor.grid'].state='on';refresh()});
 // Sparse counts fill the lower row first, including after a device disappears.
 const compactHeights = new Map();
 for(const count of [0,1,2,3,4,5,6,2,4]){
  await page.evaluate(count=>{for(let i=0;i<20;i++){states[`sensor.load_${i}`].state=String(i<count?600-i*25:0);states[`sensor.load_${i}`].attributes.unit_of_measurement='W'}refresh()},count);
  assert.deepEqual(await page.evaluate(()=>[...card._consumerNodes.values()].map(n=>Number(n.dataset.slot)).sort((a,b)=>a-b)),Array.from({length:count},(_,i)=>i));
  assert(await page.evaluate(count=>[...card._consumerNodes.values()].every(n=>parseFloat(n.style.top)===(Number(n.dataset.slot)<3&&count>3?105:12)),count));
  assert.equal(await page.evaluate(()=>!!card._flows.home_row_upper),count>3);
  assert.equal(await page.evaluate(()=>card._data.flow_power.home_row_lower||0),Array.from({length:Math.min(count,3)},(_,i)=>600-i*25).reduce((a,b)=>a+b,0));
  for(const width of [320,352,390,422,540,768,1150]){
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(60);
   const height=await page.evaluate(()=>card._diagram.getBoundingClientRect().height);
   if(count===0)compactHeights.set(width,height);
   assert(Math.abs(height-compactHeights.get(width)-Math.ceil(count/3)*93)<.1,`${width}px: compact height for ${count}`);
   await verifyLayout(`${width}px lower-first ${count}`);
  }
 }
 await page.evaluate(()=>{window.info=[];card.addEventListener('hass-more-info',event=>info.push(event.detail.entityId))});await page.locator('suris-ecoflow-flow-card .consumer[data-key="consumer:load_0"] .value').click();assert.deepEqual(await page.evaluate(()=>info),['sensor.load_0']);
 await page.locator('suris-ecoflow-flow-card .home .voltage .value').click();assert.deepEqual(await page.evaluate(()=>info),['sensor.load_0','sensor.home_voltage']);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>Object.values(card._flows).every(flow=>flow._animation.playState==='paused')&&Object.values(card._borders).every(border=>border._animation.playState==='paused'));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{for(let i=0;i<20;i++)states[`sensor.load_${i}`].state='0';refresh()});assert.equal(await page.evaluate(()=>card._consumerNodes.size),0);assert.equal(await page.evaluate(()=>Object.keys(card._flows).length),7);assert.equal(await page.evaluate(()=>card._nodes.home.classList.contains('supplying')),false);
 // Real text entry, round-trip feedback, array add/remove, and the limit of twenty.
 await page.evaluate(async()=>{window.editor=await customElements.get('suris-ecoflow-flow-card').getConfigElement();editor.setConfig({...config,consumers:[]});editor.hass={states};document.body.append(editor);window.published=[];editor.addEventListener('config-changed',event=>{published.push(JSON.parse(JSON.stringify(event.detail.config)));card.setConfig(event.detail.config);editor.setConfig(event.detail.config)})});
 assert(await page.evaluate(()=>editor._forms.find(form=>form.dataset.section==='home').schema.some(field=>field.name==='voltage'&&field.selector.entity.device_class==='voltage')));
 const add=page.locator('suris-ecoflow-flow-card-editor button[data-action="add-consumer"]');await add.click();
 const consumerForm=page.locator('suris-ecoflow-flow-card-editor ha-form[data-section="consumer:consumer_1"]');
 await page.evaluate(()=>{window.originalConsumerForm=editor._forms.at(-1);window.originalConsumerInput=originalConsumerForm.shadowRoot.querySelector('[data-field="color"]')});
 const name=consumerForm.locator('[data-field="name"]'),power=consumerForm.locator('[data-field="power"]'),icon=consumerForm.locator('[data-field="icon"]'),consumerColor=consumerForm.locator('[data-field="color"]');
 await name.fill('');await name.pressSequentially('Чайник');await power.fill('sensor.load_0');await icon.fill('mdi:kettle');
 for(const value of ['','r','re','red','','#','#f','#ff','#ff0','#ff00','#ff000','#ff0000']){await consumerColor.fill(value);assert.equal(await consumerColor.inputValue(),value);assert(await page.evaluate(()=>originalConsumerForm.isConnected&&originalConsumerInput.isConnected&&originalConsumerForm===editor._forms.at(-1)));assert(await consumerColor.evaluate(input=>input.getRootNode().activeElement===input))}
 await consumerColor.fill('orange');assert.equal(await page.evaluate(()=>published.at(-1).consumers[0].color),'orange');
 await page.evaluate(()=>{states['sensor.load_0'].state='100';refresh()});assert.deepEqual(await page.evaluate(()=>({border:getComputedStyle(card._consumerNodes.get('consumer_1')).borderTopColor,line:getComputedStyle(card._flows.home_consumer_consumer_1.querySelector('.flow-dashes')).stroke})),{border:'rgb(255, 165, 0)',line:'rgb(41, 150, 255)'});
 // Visual presets, native color entry, live HSL mixing, focus and default restoration.
 const consumerPalette=page.locator('suris-ecoflow-flow-card-editor .color-picker[data-color-section="consumer:consumer_1"]');
 await consumerPalette.locator('summary').click();
 await consumerPalette.locator('button[data-color="#008000"]').click();
 assert.equal(await consumerColor.inputValue(),'#008000');assert.equal(await page.evaluate(()=>published.at(-1).consumers[0].color),'#008000');
 const hue=consumerPalette.locator('input[data-component="hue"]'),sat=consumerPalette.locator('input[data-component="saturation"]'),brightness=consumerPalette.locator('input[data-component="brightness"]');
 await page.evaluate(()=>{window.originalHue=editor._colorControls.get('consumer:consumer_1.color').sliders.hue});
 await sat.press('End');await brightness.press('Home');assert.equal(await consumerColor.inputValue(),'#000000');
 await hue.press('Home');for(let i=0;i<120;i++)await hue.press('ArrowRight');
 assert(await hue.evaluate(input=>input===window.originalHue&&input.getRootNode().activeElement===input));assert.equal(await hue.inputValue(),'120');
 await brightness.press('Home');for(let i=0;i<50;i++)await brightness.press('ArrowRight');assert.equal(await consumerColor.inputValue(),'#00ff00');
 await consumerPalette.locator('input[type="color"]').fill('#aabbcc');assert.equal(await consumerColor.inputValue(),'#aabbcc');
 await consumerColor.fill('hsl(120, 100%, 25%)');assert.equal(await consumerPalette.locator('input[type="color"]').inputValue(),'#008000');
 await consumerPalette.locator('.color-reset').click();assert.equal(await consumerColor.inputValue(),'');assert.equal(await consumerPalette.locator('input[type="color"]').inputValue(),'#4b9fff');assert(!(await hue.inputValue()).includes('NaN'));
 await page.locator('suris-ecoflow-flow-card-editor details[data-section="appearance"] > summary').click();
 for(const [key,chosen]of [['grid_color','#254bdb'],['auxiliary_1_color','#6bcf37'],['auxiliary_2_color','#ff8800'],['main_color','#e84393']]){
  const palette=page.locator(`suris-ecoflow-flow-card-editor .color-picker[data-color-key="${key}"]`);await palette.locator('summary').click();await palette.locator(`button[data-color="${chosen}"]`).click();
  assert.equal(await page.evaluate(key=>published.at(-1).appearance[key],key),chosen);assert.equal(await palette.locator('input[type="color"]').inputValue(),chosen);
 }
 assert.equal(await page.evaluate(()=>getComputedStyle(card._flows.home_consumer_consumer_1.querySelector('.flow-dashes')).stroke),'rgb(37, 75, 219)');
 await page.setViewportSize({width:390,height:850});
 await page.evaluate(()=>{editor.style.setProperty('--primary-text-color','#172239');editor.style.setProperty('--secondary-background-color','#e7edf5');editor.style.setProperty('--divider-color','#ccd4df');editor.style.background='#f4f7fb';editor.style.padding='8px'});
 await consumerPalette.screenshot({path:path.join(root,'preview-colors.png')});
 for(let i=1;i<20;i++)await add.click();assert.equal(await page.evaluate(()=>editor._config.consumers.length),20);assert(await add.isDisabled());
 const remove=page.locator('suris-ecoflow-flow-card-editor details[data-section="consumer:consumer_1"] .consumer-remove');await remove.click();assert.equal(await page.evaluate(()=>editor._config.consumers.length),19);assert(!(await add.isDisabled()));assert(!(await page.evaluate(()=>card._consumerNodes.has('consumer_1'))));
 // Produce previews from the actual six-consumer layout, using illustrative readings.
 await page.evaluate(()=>{config.consumers=makeConsumers();for(let i=0;i<20;i++)states[`sensor.load_${i}`]={state:String(i<6?[1000,600,250,120,80,50][i]:0),attributes:{unit_of_measurement:'W'}};card.setConfig(config);refresh()});
 await page.setViewportSize({width:390,height:850});await page.waitForTimeout(80);await verifyLayout('preview mobile');await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-mobile.png')});
 for(const count of [0,3]){await page.evaluate(count=>{for(let i=0;i<20;i++)states[`sensor.load_${i}`].state=String(i<count?[1000,600,250][i]:0);refresh()},count);await verifyLayout(`preview compact ${count}`);await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,count?'preview-one-row.png':'preview-no-consumers.png')})}
 await page.evaluate(()=>{for(let i=0;i<20;i++)states[`sensor.load_${i}`].state=String(i<6?[1000,600,250,120,80,50][i]:0);refresh()});
 await page.setViewportSize({width:1060,height:900});await page.waitForTimeout(80);await verifyLayout('preview desktop');await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-desktop.png')});
 assert.deepEqual(errors,[]);console.log('PASS: twenty configurable consumers, strongest six, stable ties and slots, W/kW filtering, independent borders, shared row feeders in home color, static home outline and lower-first filling, automatic height for zero/one/two rows, color presets and native picker, HSL mixing through black, default reset and slider focus, all orthogonal paths and node bounds, add/remove limits, icon picker schema, draft text and colors, focus, configuration feedback, more-info and reduced motion.');await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
