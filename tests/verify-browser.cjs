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
  window.loadCardHelpers=async()=>({createCardElement:()=>({constructor:{getConfigElement:async()=>{if(!customElements.get('ha-form'))customElements.define('ha-form',class extends HTMLElement{});}}})});
  const s=(state,unit='W')=>({state:String(state),attributes:{unit_of_measurement:unit}});
  window.states={'sensor.grid':s(0),'sensor.a_in':s(0),'sensor.a_out':s(150),'sensor.a_soc':s(68,'%'),'sensor.b_in':s(0),'sensor.b_out':s(200),'sensor.b_soc':s(81,'%'),'sensor.main_in':s(.33,'kW'),'sensor.main_ac':s(0),'sensor.main_pv':s(330),'sensor.main_out':s(320),'sensor.main_soc':s(74,'%'),'sensor.home':s(320),'binary_sensor.source':s('off'),'binary_sensor.grid_available':s('off')};
  window.config={type:'custom:suris-ecoflow-flow-card',grid:{power:'sensor.grid',available_entity:'binary_sensor.grid_available',available_state:'on'},auxiliary_1:{soc:'sensor.a_soc',input_power:'sensor.a_in',output_power:'sensor.a_out'},auxiliary_2:{soc:'sensor.b_soc',input_power:'sensor.b_in',output_power:'sensor.b_out'},main:{soc:'sensor.main_soc',input_power:'sensor.main_in',output_power:'sensor.main_out',ac_input_power:'sensor.main_ac',solar_input_power:'sensor.main_pv'},home:{power:'sensor.home',source_entity:'binary_sensor.source',grid_state:'on',main_state:'off'}};
  window.card=document.createElement('suris-ecoflow-flow-card');card.setConfig(config);card.hass={states};document.querySelector('#host').append(card);
  window.refresh=()=>{card.hass={states:{...states}}};
  window.active=()=>[...card.shadowRoot.querySelectorAll('.flow.active')].map(x=>x.dataset.flow).sort();
 });
 await page.waitForFunction(()=>card.shadowRoot.querySelectorAll('.flow').length===7);
 assert.deepEqual(await page.evaluate(()=>active()),['auxiliary_1_main','auxiliary_2_main','main_home']);
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .input .value').textContent),'330 Вт');
 const motion=await page.evaluateHandle(()=>card.shadowRoot.querySelector('animateMotion'));
 await page.evaluate(()=>{states['sensor.unrelated']={state:'12',attributes:{}};refresh()});
 assert(await page.evaluate(old=>old===card.shadowRoot.querySelector('animateMotion'),motion));
 await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-desktop.png')});
 await page.evaluate(()=>{states['binary_sensor.source'].state='on';states['binary_sensor.grid_available'].state='on';states['sensor.grid'].state='800';states['sensor.a_in'].state='200';states['sensor.b_in'].state='180';states['sensor.main_ac'].state='100';refresh()});
 assert.deepEqual(await page.evaluate(()=>active()),['auxiliary_1_main','auxiliary_2_main','grid_auxiliary_1','grid_auxiliary_2','grid_home','grid_main']);
 await page.evaluate(()=>{states['binary_sensor.source'].state='unavailable';refresh()});
 assert(!(await page.evaluate(()=>active())).some(x=>x.endsWith('_home')));
 await page.evaluate(()=>{states['sensor.main_ac'].state='unavailable';states['sensor.main_pv'].state='unavailable';states['sensor.a_in'].state='unknown';refresh()});
 assert(!(await page.evaluate(()=>active())).includes('grid_main'));
 assert(!(await page.evaluate(()=>active())).includes('grid_auxiliary_1'));
 assert(!(await page.evaluate(()=>active())).includes('auxiliary_1_main'));
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .ac .value').textContent),'—');
 await page.evaluate(()=>{states['sensor.main_ac'].state='3';refresh()});
 assert(!(await page.evaluate(()=>active())).includes('grid_main'));
 await page.evaluate(()=>{states['sensor.main_ac'].state='3.1';refresh()});
 assert((await page.evaluate(()=>active())).includes('grid_main'));
 await page.evaluate(()=>{delete config.main.input_power;card.setConfig(config);states['sensor.main_ac'].state='100';states['sensor.main_pv'].state='200';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .input .value').textContent),'300 Вт');
 await page.evaluate(()=>{states['sensor.main_pv'].attributes.unit_of_measurement='Wh';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.main .solar .value').textContent),'—');
 await page.evaluate(()=>{window.more=null;card.addEventListener('hass-more-info',e=>window.more=e.detail.entityId);card.shadowRoot.querySelector('.main .output .value').click()});
 assert.equal(await page.evaluate(()=>more),'sensor.main_out');
 const result=await page.evaluate(async()=>{
  const editor=await customElements.get('suris-ecoflow-flow-card').getConfigElement();editor.setConfig(config);editor.hass={states};document.body.append(editor);
  const forms=[...editor.shadowRoot.querySelectorAll('ha-form')];
  const events=[];editor.addEventListener('config-changed',e=>events.push(e.detail.config));
  forms[5].dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...forms[5].data,power:'sensor.new_home'}},bubbles:true,composed:true}));
  forms[2].dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...forms[2].data,transfer_power:'sensor.a_dc'}},bubbles:true,composed:true}));
  editor.setConfig(events.at(-1));
  const stable=editor.shadowRoot.querySelector('ha-form')===forms[0];
  const final=events.at(-1);editor.remove();
  return{count:forms.length,events:events.length,home:final.home.power,transfer:final.auxiliary_1.transfer_power,stable};
 });
 assert.deepEqual(result,{count:7,events:2,home:'sensor.new_home',transfer:'sensor.a_dc',stable:true});
 await page.evaluate(()=>{delete config.home.power;states['binary_sensor.source'].state='on';states['binary_sensor.grid_available'].state='on';states['sensor.grid'].state='1000';states['sensor.a_in'].state='100';states['sensor.b_in'].state='200';states['sensor.main_ac'].state='300';card.setConfig(config);refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'≈ 400 Вт');
 assert((await page.evaluate(()=>active())).includes('grid_home'));
 assert(!(await page.evaluate(()=>active())).includes('main_home'));
 await page.evaluate(()=>{states['sensor.b_in'].state='unavailable';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'—');
 assert(!(await page.evaluate(()=>active())).includes('grid_home'));
 await page.evaluate(()=>{states['binary_sensor.source'].state='off';refresh()});
 assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.home .power .value').textContent),'320 Вт');
 assert((await page.evaluate(()=>active())).includes('main_home'));
 await page.evaluate(()=>{config.home.power='sensor.home';card.setConfig(config);refresh()});
 const invalid=await page.evaluate(()=>{
  try{card.setConfig({...config,home:{...config.home,main_state:'on'}});return false}catch{return true}
 });assert(invalid);
 await page.evaluate(()=>{states['sensor.main_pv'].attributes.unit_of_measurement='W';states['binary_sensor.source'].state='off';states['binary_sensor.grid_available'].state='off';states['sensor.a_in'].state='0';states['sensor.b_in'].state='0';states['sensor.main_ac'].state='0';states['sensor.main_pv'].state='330';states['sensor.grid'].state='0';card.setConfig(config);refresh()});
 await page.setViewportSize({width:390,height:800});
 await page.evaluate(()=>document.body.style.margin='8px');
 await page.waitForTimeout(100);
 const layout=await page.evaluate(()=>{
  const d=card.shadowRoot.querySelector('.diagram').getBoundingClientRect();const nodes=[...card.shadowRoot.querySelectorAll('.node')];
  return{overflows:nodes.filter(n=>n.scrollWidth>n.clientWidth+1 || n.scrollHeight>n.clientHeight+1).map(n=>n.dataset.key),outside:nodes.filter(n=>{const r=n.getBoundingClientRect();return r.left<d.left-.1||r.right>d.right+.1||r.top<d.top-.1||r.bottom>d.bottom+.1}).map(n=>n.dataset.key),rects:nodes.map(n=>({key:n.dataset.key,rect:n.getBoundingClientRect().toJSON()}))};
 });
 assert.deepEqual(layout.overflows,[]);assert.deepEqual(layout.outside,[]);
 for(let i=0;i<layout.rects.length;i++)for(let j=i+1;j<layout.rects.length;j++){const a=layout.rects[i].rect,b=layout.rects[j].rect;assert(!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top),`Overlapping nodes ${layout.rects[i].key}, ${layout.rects[j].key}`)}
 await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-mobile.png')});
 for (const width of [320, 768]) {
  await page.setViewportSize({width,height:900});await page.waitForTimeout(60);
  const problems=await page.evaluate(()=>[...card.shadowRoot.querySelectorAll('.node')].filter(n=>n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1).map(n=>n.dataset.key));
  assert.deepEqual(problems,[],`Content overflow at ${width}px`);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.evaluate(()=>getComputedStyle(card.shadowRoot.querySelector('.flow circle')).display),'none');
 await page.evaluate(()=>{const card2=document.createElement('suris-ecoflow-flow-card');card2.setConfig({type:'custom:suris-ecoflow-flow-card'});document.body.append(card2)});
 assert.deepEqual(errors,[]);
 console.log('PASS: source switching, seven flows, unavailable data, kW conversion, unsupported units, threshold, total input, editor selections, stable updates, more-info, mobile bounds, reduced motion, empty configuration.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
