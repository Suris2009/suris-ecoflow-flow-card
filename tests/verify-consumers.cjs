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
 const baselineHeight=await page.locator('suris-ecoflow-flow-card').evaluate(card=>card.getBoundingClientRect().height);
 await page.evaluate(()=>{config.consumers=makeConsumers();for(let i=0;i<20;i++)states[`sensor.load_${i}`]={state:String(600-i*25),attributes:{unit_of_measurement:'W'}};card.setConfig(config);refresh()});
 assert.deepEqual(await page.evaluate(()=>visibleIds()),['load_0','load_1','load_2','load_3','load_4','load_5']);
 assert.equal(await page.locator('suris-ecoflow-flow-card').evaluate(card=>card.getBoundingClientRect().height),baselineHeight);
 const verifyLayout=async label=>{
  const result=await page.evaluate(()=>{
   const d=card._diagram.getBoundingClientRect(),all=[...card.shadowRoot.querySelectorAll('.node')];
   const bounds=node=>{const r=node.getBoundingClientRect();return{x:r.left-d.left,y:r.top-d.top,right:r.right-d.left,bottom:r.bottom-d.top,w:r.width,h:r.height}};
   const nodes=Object.fromEntries(all.map(node=>[node.dataset.key,bounds(node)]));
   const paths=Object.entries(card._flows).map(([name,flow])=>{const path=flow.querySelector('.flow-track'),length=path.getTotalLength();return{name,d:path.getAttribute('d'),points:Array.from({length:Math.ceil(length/2)+1},(_,i)=>{const p=path.getPointAtLength(Math.min(length,i*2));return{x:p.x,y:p.y}}),start:path.getPointAtLength(0).toJSON?.()||{x:path.getPointAtLength(0).x,y:path.getPointAtLength(0).y},end:{x:path.getPointAtLength(length).x,y:path.getPointAtLength(length).y},color:getComputedStyle(flow.querySelector('.flow-dashes')).stroke}});
   const overflow=all.filter(node=>node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1).map(node=>node.dataset.key);
   return{height:d.height,width:d.width,nodes,paths,overflow};
  });
  assert.equal(result.paths.length,13,`${label}: six consumer routes required`);assert.deepEqual(result.overflow,[],`${label}: overflow`);
  for(const [key,n]of Object.entries(result.nodes)){assert(n.x>=-.1&&n.y>=-.1&&n.right<=result.width+.1&&n.bottom<=result.height+.1,`${label}: outside ${key}`)}
  const nodes=Object.entries(result.nodes);for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const [ka,a]=nodes[i],[kb,b]=nodes[j];assert(!(a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y),`${label}: ${ka} overlaps ${kb}`)}
  const standard={grid_auxiliary_1:['grid','auxiliary_1'],grid_auxiliary_2:['grid','auxiliary_2'],grid_main:['grid','main'],grid_home:['grid','home'],auxiliary_1_main:['auxiliary_1','main'],auxiliary_2_main:['auxiliary_2','main'],main_home:['main','home']};
  const onBorder=(p,n)=>p.x>=n.x-.3&&p.x<=n.right+.3&&p.y>=n.y-.3&&p.y<=n.bottom+.3&&Math.min(Math.abs(p.x-n.x),Math.abs(p.x-n.right),Math.abs(p.y-n.y),Math.abs(p.y-n.bottom))<.3;
  for(const route of result.paths){assert((route.d.match(/[A-Za-z]/g)||[]).every(command=>['M','H','V'].includes(command)),`${label}: diagonal ${route.name}`);const [source,target]=standard[route.name]||['home','consumer:'+route.name.slice(14)];assert(onBorder(route.start,result.nodes[source])&&onBorder(route.end,result.nodes[target]),`${label}: wrong endpoints ${route.name}`);for(const p of route.points){assert(p.x>=-.3&&p.y>=-.3&&p.x<=result.width+.3&&p.y<=result.height+.3,`${label}: path outside ${route.name}`);for(const [key,n]of nodes)if(key!==source&&key!==target)assert(!(p.x>n.x+.3&&p.x<n.right-.3&&p.y>n.y+.3&&p.y<n.bottom-.3),`${label}: ${route.name} crosses ${key} at ${p.x},${p.y}`)}}
  assert(result.nodes.auxiliary_1.right<result.nodes.main.x&&result.nodes.main.right<result.nodes.auxiliary_2.x,`${label}: stations must flank main`);
 };
 for(const width of [320,352,390,422,540,768,1150]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(80);await verifyLayout(`${width}px`)}
 // Retained tiles and station animations survive a strongest-consumer replacement.
 await page.evaluate(()=>{window.retainedNode=card._consumerNodes.get('load_0');window.retainedAnimation=card._flows.grid_home._animation;window.previousOrder=[...card._consumerOrder];states['sensor.load_19'].state='2000';refresh()});
 assert.deepEqual(await page.evaluate(()=>visibleIds()),['load_0','load_1','load_19','load_2','load_3','load_4']);
 assert(await page.evaluate(()=>card._consumerNodes.get('load_0')===retainedNode&&card._flows.grid_home._animation===retainedAnimation));
 assert.equal(await page.evaluate(()=>card._consumerOrder[5]),'load_19');
 await page.evaluate(()=>{states['sensor.load_5'].state='2000';refresh()});assert((await page.evaluate(()=>visibleIds())).includes('load_19'),'Equal power must not evict an existing tile');
 for(const value of ['unavailable','unknown','0','-10','3']){await page.evaluate(value=>{states['sensor.load_19'].state=value;refresh()},value);assert(!(await page.evaluate(()=>visibleIds())).includes('load_19'))}
 await page.evaluate(()=>{states['sensor.load_19'].state='2';states['sensor.load_19'].attributes.unit_of_measurement='kW';refresh()});assert((await page.evaluate(()=>visibleIds())).includes('load_19'));
 await page.evaluate(()=>{states['sensor.load_19'].attributes.unit_of_measurement='kWh';refresh()});assert(!(await page.evaluate(()=>visibleIds())).includes('load_19'));
 // Independent CSS colors match each device outline and its home feed.
 await page.evaluate(()=>{config.consumers[0].color='orange';card.setConfig(config);refresh()});
 const color=await page.evaluate(()=>({border:getComputedStyle(card._consumerNodes.get('load_0')).borderTopColor,line:getComputedStyle(card._flows.home_consumer_load_0.querySelector('.flow-dashes')).stroke}));assert.deepEqual(color,{border:'rgb(255, 165, 0)',line:'rgb(255, 165, 0)'});
 await page.evaluate(()=>{window.info=[];card.addEventListener('hass-more-info',event=>info.push(event.detail.entityId))});await page.locator('suris-ecoflow-flow-card .consumer[data-key="consumer:load_0"] .value').click();assert.deepEqual(await page.evaluate(()=>info),['sensor.load_0']);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>Object.values(card._flows).every(flow=>flow._animation.playState==='paused')&&Object.values(card._borders).every(border=>border._animation.playState==='paused'));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{for(let i=0;i<20;i++)states[`sensor.load_${i}`].state='0';refresh()});assert.equal(await page.evaluate(()=>card._consumerNodes.size),0);assert.equal(await page.evaluate(()=>Object.keys(card._flows).length),7);assert.equal(await page.evaluate(()=>card._nodes.home.classList.contains('supplying')),false);
 // Real text entry, round-trip feedback, array add/remove, and the limit of twenty.
 await page.evaluate(async()=>{window.editor=await customElements.get('suris-ecoflow-flow-card').getConfigElement();editor.setConfig({...config,consumers:[]});editor.hass={states};document.body.append(editor);window.published=[];editor.addEventListener('config-changed',event=>{published.push(JSON.parse(JSON.stringify(event.detail.config)));card.setConfig(event.detail.config);editor.setConfig(event.detail.config)})});
 const add=page.locator('suris-ecoflow-flow-card-editor button[data-action="add-consumer"]');await add.click();
 const consumerForm=page.locator('suris-ecoflow-flow-card-editor ha-form[data-section="consumer:consumer_1"]');
 await page.evaluate(()=>{window.originalConsumerForm=editor._forms.at(-1);window.originalConsumerInput=originalConsumerForm.shadowRoot.querySelector('[data-field="color"]')});
 const name=consumerForm.locator('[data-field="name"]'),power=consumerForm.locator('[data-field="power"]'),icon=consumerForm.locator('[data-field="icon"]'),consumerColor=consumerForm.locator('[data-field="color"]');
 await name.fill('');await name.pressSequentially('Чайник');await power.fill('sensor.load_0');await icon.fill('mdi:kettle');
 for(const value of ['','r','re','red','','#','#f','#ff','#ff0','#ff00','#ff000','#ff0000']){await consumerColor.fill(value);assert.equal(await consumerColor.inputValue(),value);assert(await page.evaluate(()=>originalConsumerForm.isConnected&&originalConsumerInput.isConnected&&originalConsumerForm===editor._forms.at(-1)));assert(await consumerColor.evaluate(input=>input.getRootNode().activeElement===input))}
 await consumerColor.fill('orange');assert.equal(await page.evaluate(()=>published.at(-1).consumers[0].color),'orange');
 await page.evaluate(()=>{states['sensor.load_0'].state='100';refresh()});assert.deepEqual(await page.evaluate(()=>({border:getComputedStyle(card._consumerNodes.get('consumer_1')).borderTopColor,line:getComputedStyle(card._flows.home_consumer_consumer_1.querySelector('.flow-dashes')).stroke})),{border:'rgb(255, 165, 0)',line:'rgb(255, 165, 0)'});
 for(let i=1;i<20;i++)await add.click();assert.equal(await page.evaluate(()=>editor._config.consumers.length),20);assert(await add.isDisabled());
 const remove=page.locator('suris-ecoflow-flow-card-editor details[data-section="consumer:consumer_1"] .consumer-remove');await remove.click();assert.equal(await page.evaluate(()=>editor._config.consumers.length),19);assert(!(await add.isDisabled()));assert(!(await page.evaluate(()=>card._consumerNodes.has('consumer_1'))));
 // Produce previews from the actual six-consumer layout, using illustrative readings.
 await page.evaluate(()=>{config.consumers=makeConsumers();for(let i=0;i<20;i++)states[`sensor.load_${i}`]={state:String(i<6?[1000,600,250,120,80,50][i]:0),attributes:{unit_of_measurement:'W'}};card.setConfig(config);refresh()});
 await page.setViewportSize({width:390,height:850});await page.waitForTimeout(80);await verifyLayout('preview mobile');await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-mobile.png')});
 await page.setViewportSize({width:1060,height:900});await page.waitForTimeout(80);await verifyLayout('preview desktop');await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-desktop.png')});
 assert.deepEqual(errors,[]);console.log('PASS: twenty configurable consumers, strongest six, stable ties and slots, W/kW filtering, per-device colors and home lines, unchanged mobile height, all orthogonal paths and node bounds, add/remove limits, icon picker schema, draft text and colors, focus, configuration feedback, more-info and reduced motion.');await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
