const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.SURIS_CHROMIUM_PATH ? {executablePath:process.env.SURIS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1040,height:1000}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setContent('<body style="margin:24px;background:#e1e5ef;color:#172239;font-family:Arial"><div id="host"></div></body>');
    await page.addScriptTag({path:path.join(root,'suris-ecoflow-flow-card.js')});
    await page.evaluate(()=>{
      const s=value=>({state:String(value),attributes:{unit_of_measurement:'W'}});
      window.states={'sensor.grid':s(258),'sensor.a_in':s(0),'sensor.a_out':s(0),'sensor.a_soc':s('unavailable'),'sensor.b_in':s(0),'sensor.b_out':s(0),'sensor.b_soc':s(59),'sensor.main_in':s('unavailable'),'sensor.main_ac':s('unavailable'),'sensor.main_out':s('unavailable'),'sensor.main_soc':s('unavailable'),'sensor.voltage':s(221),'binary_sensor.grid':s('on')};
      window.config={grid:{power:'sensor.grid',available_entity:'binary_sensor.grid'},auxiliary_1:{name:'Delta Max',soc:'sensor.a_soc',input_power:'sensor.a_in',output_power:'sensor.a_out'},auxiliary_2:{name:'River Max',soc:'sensor.b_soc',input_power:'sensor.b_in',output_power:'sensor.b_out'},main:{name:'Delta 2 Max',soc:'sensor.main_soc',input_power:'sensor.main_in',ac_input_power:'sensor.main_ac',output_power:'sensor.main_out'},home:{name:'Споживання дому',voltage:'sensor.voltage'},appearance:{grid_color:'#123080',main_color:'#b71919',auxiliary_1_color:'green',auxiliary_2_color:'#e88822'}};
      window.card=document.createElement('suris-ecoflow-flow-card');card.setConfig(config);
      card.style.setProperty('--ha-card-background','linear-gradient(135deg,#e8e3ec,#c3dbea)');card.style.setProperty('--primary-text-color','#172239');card.style.setProperty('--secondary-text-color','#4d5666');card.style.setProperty('--divider-color','#ffffff');
      card.hass={states};document.querySelector('#host').append(card);
      window.refresh=()=>{card.hass={states:{...states}}};
      window.active=()=>Object.entries(card._flows).filter(([,flow])=>flow.classList.contains('active')).map(([name])=>name).sort();
    });
    await page.waitForFunction(()=>Object.keys(card._flows).length===7);
    await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-offline-grid.png')});
    assert.deepEqual(await page.evaluate(()=>active()),['grid_home'],'258 W city grid must supply Home when all stations are idle or unavailable');
    assert.equal(await page.evaluate(()=>card._values['home.power'].textContent),'258 W');
    assert.equal(await page.evaluate(()=>card._values['home.voltage'].textContent),'221 V');
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.status').textContent),'');
    assert.equal(await page.evaluate(()=>getComputedStyle(card._nodes.home).borderTopColor),'rgb(18, 48, 128)');
    assert.equal(await page.evaluate(()=>getComputedStyle(card._flows.grid_home.querySelector('.flow-dashes')).visibility),'visible');
    assert.equal(await page.evaluate(()=>card._flows.grid_home._animation.playState),'running');
    const frame=await page.evaluate(()=>card._flows.grid_home._animation.currentTime);
    await page.waitForFunction(frame=>card._flows.grid_home._animation.currentTime>frame,frame);
    for(const state of ['off','unknown','unavailable','']){
      await page.evaluate(state=>{states['binary_sensor.grid'].state=state;refresh()},state);
      assert.deepEqual(await page.evaluate(()=>active()),['grid_home']);
    }
    await page.evaluate(()=>{states['sensor.a_in'].state='50';refresh()});
    assert.equal(await page.evaluate(()=>card._values['home.power'].textContent),'208 W');
    assert.deepEqual(await page.evaluate(()=>active()),['grid_auxiliary_1','grid_home']);
    await page.evaluate(()=>{states['sensor.main_out'].state='320';refresh()});
    assert((await page.evaluate(()=>active())).includes('main_home'));assert(!(await page.evaluate(()=>active())).includes('grid_home'));
    await page.evaluate(()=>{states['sensor.main_out'].state='unavailable';states['sensor.grid'].state='unavailable';refresh()});
    assert(!(await page.evaluate(()=>active())).some(name=>name.endsWith('_home')));
    assert(!/Вибери|Select/.test(await page.evaluate(()=>card.shadowRoot.querySelector('.status').textContent)),'An unavailable configured sensor must not prompt entity selection');
    const neutral=await page.evaluate(()=>({home:getComputedStyle(card._nodes.home).borderTopColor,line:getComputedStyle(card._flows.grid_home.querySelector('.flow-track')).stroke}));
    assert(!['rgb(255, 255, 255)','rgba(255, 255, 255, 0)'].includes(neutral.home));
    assert(!['rgb(255, 255, 255)','rgba(255, 255, 255, 0)'].includes(neutral.line));
    await page.evaluate(()=>{states['sensor.grid'].state='258';states['sensor.a_in'].state='0';states['binary_sensor.grid'].state='on';refresh()});
    for(const width of [320,390,768,1040]){
      await page.setViewportSize({width,height:1000});
      assert.equal(await page.evaluate(()=>getComputedStyle(card._flows.grid_home.querySelector('.flow-dashes')).visibility),'visible');
      assert(await page.evaluate(()=>card._flows.grid_home.querySelector('.flow-dashes').getTotalLength()>10));
    }
    await page.setViewportSize({width:1040,height:1000});
    await page.locator('suris-ecoflow-flow-card').screenshot({path:path.join(root,'preview-offline-grid.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: screenshot case, offline main station, 258 W grid-to-home flow, live animation, grid warning independence, charging subtraction, main output priority, visible unknown-source frame and tracks.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
