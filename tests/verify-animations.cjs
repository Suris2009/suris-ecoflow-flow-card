const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.SURIS_CHROMIUM_PATH ? {executablePath:process.env.SURIS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1150,height:1000}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setContent('<body style="margin:16px;background:#111;color:#eee;font-family:Arial"><div id="host"></div></body>');
    await page.addScriptTag({path:path.join(root,'suris-ecoflow-flow-card.js')});
    await page.evaluate(()=>{
      const reading=value=>({state:String(value),attributes:{unit_of_measurement:'W'}});
      window.states={'sensor.grid':reading(2000),'sensor.ac':reading(300),'sensor.main':reading(0),'sensor.a_in':reading(200),'sensor.b_in':reading(100),'sensor.a_out':reading(0),'sensor.b_out':reading(0)};
      window.config={grid:{power:'sensor.grid'},main:{ac_input_power:'sensor.ac',output_power:'sensor.main'},auxiliary_1:{input_power:'sensor.a_in',output_power:'sensor.a_out'},auxiliary_2:{input_power:'sensor.b_in',output_power:'sensor.b_out'},consumers:Array.from({length:6},(_,i)=>({id:`load_${i}`,name:`Load ${i}`,power:`sensor.load_${i}`}))};
      config.consumers.forEach((c,i)=>states[c.power]=reading(100+i*50));
      window.card=document.createElement('suris-ecoflow-flow-card');card.setConfig(config);card.hass={states};document.querySelector('#host').append(card);
      window.choose=(style,size=5)=>{config.appearance={...config.appearance,animation:style,dot_size:size};card.setConfig(config)};
      window.refresh=()=>{card.hass={states:{...states}}};
    });
    await page.waitForFunction(()=>Object.keys(card._flows).length===15);
    for(const style of ['dashes','dots','arrows','pulse','single_dot']) {
      await page.evaluate(style=>choose(style),style);
      for(const width of [320,390,768,1150]) {
        await page.setViewportSize({width,height:1000});
        await page.waitForTimeout(70);
        const result=await page.evaluate(()=>Object.entries(card._flows).map(([name,f])=>({name,active:f.classList.contains('active'),track:getComputedStyle(f.querySelector('.flow-track')).visibility,particles:[...f.querySelectorAll('.flow-particle')].map(p=>({visible:getComputedStyle(p).visibility,display:getComputedStyle(p).display})),animations:f._animations.map(a=>a.playState)})));
        for(const flow of result) {
          assert.equal(flow.track,flow.active?'visible':'hidden',`${style}/${width}: ${flow.name} track`);
          assert(flow.animations.every(state=>state===(flow.active?'running':'paused')),`${style}/${width}: ${flow.name} playback`);
          if(style==='single_dot') assert.equal(flow.particles.length,flow.name.startsWith('home_consumer_')?0:1,`One continuous dot on ${flow.name}`);
          if(['dots','arrows','single_dot'].includes(style)&&flow.name.startsWith('home_consumer_')) assert.equal(flow.animations.length,0,'A branch must receive the row particle instead of running its own loop');
          if(style==='arrows'||style==='single_dot') assert(flow.particles.every(p=>p.visible===(flow.active?'visible':'hidden')&&p.display!=='none'));
        }
        if(['dots','single_dot','arrows'].includes(style)) {
          const samples=await page.evaluate(()=>{
            const base=card._diagram.getBoundingClientRect(); const out=[];
            for(const [name,flow]of Object.entries(card._flows)) {
              const particle=flow.querySelector('.flow-particle');if(!particle)continue;
              const path=flow.querySelector('.motion-route')||flow.querySelector('.flow-track'),length=path.getTotalLength(),animation=flow._animations[0];
              animation.pause();
              for(const progress of [.05,.25,.50,.75,.95]) {
                animation.currentTime=progress*1000;
                const expected=path.getPointAtLength(length*progress),actual=new DOMPoint(0,0).matrixTransform(particle.getScreenCTM());
                const ahead=path.getPointAtLength(Math.min(length,length*progress+.05));
                const matrix=particle.getScreenCTM();
                out.push({name,error:Math.hypot(actual.x-base.left-expected.x,actual.y-base.top-expected.y),angle:Math.atan2(matrix.b,matrix.a),tangent:Math.atan2(ahead.y-expected.y,ahead.x-expected.x)});
              }
            }
            card._syncFlows();return out;
          });
          for(const sample of samples) {
            assert(sample.error<.3,`${style}/${width}: particle left ${sample.name} by ${sample.error}px`);
            if(style==='arrows') assert(Math.cos(sample.angle-sample.tangent)>.99,`${style}/${width}: arrow faces backwards on ${sample.name}`);
          }
        }
      }
      await page.evaluate(()=>{
        window.flow=card._flows.grid_home;window.animation=flow._animations[0];window.rate=animation.playbackRate;
        states['sensor.grid'].state='4000';refresh();
      });
      await page.waitForFunction(()=>animation.playbackRate>rate);
      assert(await page.evaluate(()=>animation===card._flows.grid_home._animations[0]&&animation.playbackRate>rate),`${style}: watts must adjust speed without replacing animation`);
      await page.evaluate(()=>{states['sensor.main'].state='700';refresh()});
      assert(await page.evaluate(()=>card._flows.main_home.classList.contains('active')&&!card._flows.grid_home.classList.contains('active')),`${style}: home source switching`);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>Object.values(card._flows).every(f=>f._animations.every(a=>a.playState==='paused')));
      assert(await page.evaluate(()=>Object.values(card._flows).every(f=>f._animations.every(a=>a.playState==='paused'))),`${style}: reduced motion`);
      assert(await page.evaluate(()=>[...card.shadowRoot.querySelectorAll('.flow.active .flow-particle,.flow.active .flow-dashes')].every(p=>getComputedStyle(p).display==='none')),`${style}: static reduced-motion view`);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.evaluate(()=>card.remove());
      assert(await page.evaluate(()=>Object.values(card._flows).every(f=>f._animations.every(a=>a.playState==='paused'))),`${style}: disconnect must pause all particles`);
      await page.evaluate(()=>{document.querySelector('#host').append(card);states['sensor.grid'].state='2000';states['sensor.main'].state='0';refresh()});
    }
    for(const style of ['dots','single_dot']) {
      await page.evaluate(style=>{choose(style,2);window.saved=card._flows.grid_home._animation},style);
      for(const size of [10,3,7]) {
        await page.evaluate(({style,size})=>choose(style,size),{style,size});
        assert(await page.evaluate(()=>saved===card._flows.grid_home._animation),`${style}: resizing must retain animation`);
        const diameter=await page.evaluate(style=>style==='single_dot'?2*Number(card._flows.grid_home.querySelector('circle').getAttribute('r')):parseFloat(getComputedStyle(card._flows.grid_home.querySelector('.flow-dashes')).strokeWidth),style);
        assert.equal(diameter,size);
        assert(await page.evaluate(size=>[...card.shadowRoot.querySelectorAll('circle.flow-particle')].every(p=>Number(p.getAttribute('r'))===size/2),size),'Row dots must follow the shared size slider');
      }
    }
    for(const style of ['dots','arrows','single_dot']) {
      for(const count of [1,2,3,4,6]) {
        await page.evaluate(({style,count})=>{
          config.consumers.forEach((c,i)=>states[c.power].state=String(i<count?100+i*50:0));
          choose(style);refresh();
        },{style,count});
        const junctions=await page.evaluate(()=>{
          const base=card._diagram.getBoundingClientRect(),out=[];
          for(const [name,flow]of Object.entries(card._flows)) {
            if(!name.startsWith('home_row_'))continue;
            const animation=flow._animations[0],particle=flow.querySelector('.flow-particle');animation.pause();
            const route=flow.querySelector('.motion-route'),length=route.getTotalLength();let before=0;
            const probe=document.createElementNS('http://www.w3.org/2000/svg','path');probe.style.display='none';flow.append(probe);
            for(const journey of flow._journeys) {
              probe.setAttribute('d',journey);const journeyLength=probe.getTotalLength();
              // Branches are 10 px high: sample immediately before the turn,
              // on the turn and immediately after it, using the same particle.
              for(const delta of [-.1,0,.1,5]) {
                const distance=before+journeyLength-10+delta;
                animation.currentTime=1000*distance/length;
                const expected=route.getPointAtLength(distance),actual=new DOMPoint(0,0).matrixTransform(particle.getScreenCTM());
                out.push({name,error:Math.hypot(actual.x-base.left-expected.x,actual.y-base.top-expected.y)});
              }
              before+=journeyLength;
            }
            probe.remove();
          }
          card._syncFlows();return out;
        });
        assert(junctions.length>0);
        for(const point of junctions)assert(point.error<.3,`${style}/${count}: consumer junction continuity failed on ${point.name}: ${point.error}`);
      }
    }
    await page.evaluate(()=>{
      customElements.define('ha-form',class extends HTMLElement {
        set schema(value){this._schema=value} get schema(){return this._schema}
        set data(value){this._data=value} get data(){return this._data}
      });
      window.editor=document.createElement('suris-ecoflow-flow-card-editor');editor.setConfig(config);editor.hass={states};document.body.append(editor);
      editor.addEventListener('config-changed',event=>{window.persisted=event.detail.config;editor.setConfig(persisted);card.setConfig(persisted)});
    });
    await page.waitForFunction(()=>editor._forms?.length>0);
    for(const language of ['uk','en']) {
      await page.evaluate(language=>editor.setConfig({...config,language}),language);
      const schema=await page.evaluate(()=>editor._forms.find(f=>f.dataset.section==='appearance').schema);
      const options=schema.find(f=>f.name==='animation').selector.select.options;
      assert.equal(options.length,5);assert.equal(new Set(options.map(o=>o.label)).size,5);
      const slider=schema.find(f=>f.name==='dot_size').selector.number;assert.equal(slider.mode,'slider');assert.equal(slider.min,2);assert.equal(slider.max,10);
      for(const style of options.map(o=>o.value)) {
        await page.evaluate(style=>{const form=editor._forms.find(f=>f.dataset.section==='appearance');form.dispatchEvent(new CustomEvent('value-changed',{detail:{value:{...form.data,animation:style,dot_size:8}}}))},style);
        assert.equal(await page.evaluate(()=>persisted.appearance.animation),style);
        assert.equal(await page.evaluate(()=>card._config.appearance.animation),style);
        assert.equal(await page.evaluate(()=>persisted.appearance.dot_size),8);
      }
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: five animation styles, one dot per feeder and complete consumer journeys, continuous junctions with one to six consumers, exact path and arrow direction at 320–1150 px, dot size without restart, power speed, source switching, reduced motion, disconnect and visual editor persistence.');
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
