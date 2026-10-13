const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  if (req.url === '/card.js') { res.setHeader('Content-Type', 'text/javascript; charset=utf-8'); res.end(fs.readFileSync(path.join(root, 'suris-ecoflow-flow-card.js'))); }
  else { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end('<!doctype html><html><body style="margin:0;background:#111;color:#eee;font-family:Arial"><div id="host"></div><script src="/card.js"></script></body></html>'); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.SURIS_CHROMIUM_PATH ? { executablePath: process.env.SURIS_CHROMIUM_PATH, args: ['--no-sandbox', '--no-zygote', '--disable-dev-shm-usage'] } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(() => {
      const s = (value, unit = 'W') => ({ state: String(value), attributes: { unit_of_measurement: unit } });
      window.states = { 'sensor.grid': s(2100), 'binary_sensor.grid': s('on'), 'sensor.a_in': s(0), 'sensor.b_in': s(0), 'sensor.m_in': s(0), 'sensor.a_out': s(0), 'sensor.b_out': s(0), 'sensor.m_out': s(0), 'sensor.m_ac': s(0), 'sensor.m_pv1': s(0), 'sensor.m_pv2': s(0), 'sensor.a_soc': s(68, '%'), 'sensor.b_soc': s(81, '%'), 'sensor.m_soc': s(74, '%'), 'sensor.voltage': s(230, 'V') };
      const devices = [['boiler', 'Бойлер', 1000, '#cb526e'], ['kettle', 'Чайник', 600, '#ffac12'], ['washer', 'Пральна', 250, '#9870ef'], ['fridge', 'Холодильник', 120, '#29b0b9'], ['light', 'Освітлення', 80, '#4eb95c'], ['outlets', 'Розетки', 50, '#6b87df']];
      devices.forEach(([id, , value]) => states[`sensor.${id}`] = s(value));
      window.config = { type: 'custom:suris-ecoflow-flow-card', title: 'Енергопотоки', grid: { power: 'sensor.grid', available_entity: 'binary_sensor.grid', available_state: 'on' }, auxiliary_1: { soc: 'sensor.a_soc', input_power: 'sensor.a_in', output_power: 'sensor.a_out' }, auxiliary_2: { soc: 'sensor.b_soc', input_power: 'sensor.b_in', output_power: 'sensor.b_out' }, main: { soc: 'sensor.m_soc', input_power: 'sensor.m_in', output_power: 'sensor.m_out', ac_input_power: 'sensor.m_ac', solar_input_power: 'sensor.m_pv1', solar_input_power_2: 'sensor.m_pv2' }, home: { voltage: 'sensor.voltage' }, consumers: devices.map(([id, name, , color]) => ({ id, name, power: `sensor.${id}`, color })), appearance: { layout: 'sideflow' } };
      window.card = document.createElement('suris-ecoflow-flow-card'); card.setConfig(config); card.hass = { states }; document.querySelector('#host').append(card);
      window.refresh = () => card.hass = { states: { ...states } };
      window.setCount = count => { for (let i = 0; i < config.consumers.length; i++) states[config.consumers[i].power].state = String(i < count ? devices[i][2] : 0); refresh(); };
    });
    const settled = async () => { await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); };
    const geometry = () => page.evaluate(() => {
      const d = card._diagram.getBoundingClientRect();
      const nodes = Object.fromEntries([...card.shadowRoot.querySelectorAll('.node')].map(node => { const r = node.getBoundingClientRect(); return [node.dataset.key, { left: r.left - d.left, top: r.top - d.top, right: r.right - d.left, bottom: r.bottom - d.top }]; }));
      const paths = Object.values(card._flows).map(flow => { const p = flow.querySelector('.flow-track'), length = p.getTotalLength(); return { name: flow.dataset.flow, length, color: getComputedStyle(p).stroke, trackVisible: getComputedStyle(p).visibility, active: flow.classList.contains('active'), samples: Array.from({ length: 121 }, (_, i) => { const q = p.getPointAtLength(length * i / 120); return { x: q.x, y: q.y }; }) }; });
      const fontSizes = [...card.shadowRoot.querySelectorAll('.node h3,.row,.consumer .value')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height).map(e => parseFloat(getComputedStyle(e).fontSize));
      const clipped = [...card.shadowRoot.querySelectorAll('.node h3,.value,.label,.grid-outage')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height && !e.hidden).map(e => ({ text: e.textContent, clipped: e.scrollWidth > e.clientWidth + 1, width:e.clientWidth, scrollWidth:e.scrollWidth, font:getComputedStyle(e).fontSize, wrap:getComputedStyle(e).overflowWrap, whitespace:getComputedStyle(e).whiteSpace }));
      const identities = ['grid', 'home'].map(key => { const node = card._nodes[key]; return { name: getComputedStyle(node.querySelector('h3')).display, icon: getComputedStyle(node.querySelector('.icon')).display, svg: getComputedStyle(node.querySelector('.icon svg')).display }; });
      const powerFonts = ['grid.output', 'home.power'].map(key => getComputedStyle(card._values[key]).fontSize);
      const captions = [...card._consumerNodes.values()].map(node => { const h = node.querySelector('h3'), style = getComputedStyle(h); return { text: h.textContent, full: h.title, aria: h.getAttribute('aria-label'), whitespace: style.whiteSpace, height: h.getBoundingClientRect().height, lineHeight: parseFloat(style.lineHeight) }; });
      return { width: d.width, height: d.height, nodes, paths, fontSizes, clipped, identities, powerFonts, captions };
    });
    const onBorder = (p, r) => p.x >= r.left - .3 && p.x <= r.right + .3 && p.y >= r.top - .3 && p.y <= r.bottom + .3 && Math.min(Math.abs(p.x - r.left), Math.abs(p.x - r.right), Math.abs(p.y - r.top), Math.abs(p.y - r.bottom)) < .3;
    const intersects = (a, b, c, d) => {
      const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
      return cross(a, b, c) * cross(a, b, d) < -1e-6 && cross(c, d, a) * cross(c, d, b) < -1e-6;
    };
    const verify = async (label, count, checkCrossings = true) => {
      await settled(); const g = await geometry();
      assert.equal(g.paths.length, 7 + count, `${label}: one direct route per consumer`);
      assert(Math.min(...g.fontSizes) >= 11, `${label}: unreadable text`);
      assert(!g.clipped.some(e => e.clipped), `${label}: clipped text ${JSON.stringify(g.clipped.filter(e => e.clipped))}`);
      assert.equal(g.powerFonts[0], g.powerFonts[1], `${label}: grid output and home input must use the same font size`);
      assert(g.identities.every(n => n.name === 'none' && n.icon === 'flex'), `${label}: grid/home must show icons instead of names`);
      const consumers = Object.entries(g.nodes).filter(([key]) => key.startsWith('consumer:')).map(([, r]) => ({ width: r.right - r.left, height: r.bottom - r.top }));
      for (const c of consumers) {
        assert(c.width > c.height + 10, `${label}: consumer must be a wider rectangle`);
        assert(Math.abs(c.height - Math.max(60, Math.min(64, g.width * .16))) < .3, `${label}: consumer height changed`);
        assert(Math.abs(c.width - consumers[0].width) < .3 && Math.abs(c.height - consumers[0].height) < .3, `${label}: unequal consumer rectangles`);
      }
      assert(g.powerFonts.every(font => parseFloat(font) <= 15), `${label}: grid/home power font is too large`);
      for (const h of g.captions) {
        assert.equal(h.whitespace, 'nowrap', `${label}: consumer title wraps`);
        assert(h.height <= h.lineHeight + .3, `${label}: title spans multiple lines`);
        assert.equal(h.aria, h.full, `${label}: full consumer title is not accessible`);
        if (h.text !== h.full) { assert(h.text.endsWith('..') && !h.text.endsWith('...'), `${label}: title must end with exactly two dots`); assert(h.full.startsWith(h.text.slice(0, -2)), `${label}: shortened title is not a prefix`); }
      }
      const entries = Object.entries(g.nodes);
      for (let i = 0; i < entries.length; i++) {
        const [key, r] = entries[i];
        assert(r.left >= -.3 && r.top >= -.3 && r.right <= g.width + .3 && r.bottom <= g.height + .3, `${label}: clipped node ${key}`);
        for (let j = i + 1; j < entries.length; j++) { const [other, q] = entries[j]; assert(!(r.left < q.right - .3 && r.right > q.left + .3 && r.top < q.bottom - .3 && r.bottom > q.top + .3), `${label}: overlapping ${key} and ${other}`); }
      }
      const connections = { grid_main: ['grid', 'main'], grid_home: ['grid', 'home'], main_home: ['main', 'home'], grid_auxiliary_1: ['grid', 'auxiliary_1'], grid_auxiliary_2: ['grid', 'auxiliary_2'], auxiliary_1_main: ['auxiliary_1', 'main'], auxiliary_2_main: ['auxiliary_2', 'main'] };
      for (const route of g.paths) {
        const [source, target] = connections[route.name] || ['home', `consumer:${route.name.slice(14)}`];
        assert(onBorder(route.samples[0], g.nodes[source]) && onBorder(route.samples.at(-1), g.nodes[target]), `${label}: detached ${route.name}`);
        assert.equal(route.trackVisible, route.active ? 'visible' : 'hidden', `${label}: inactive line visible`);
        if (source === 'home') assert(route.length >= 28 && route.samples.at(-1).x - route.samples[0].x >= 27.9, `${label}: consumer line too short`);
        for (const p of route.samples) {
          assert(p.x >= -.3 && p.y >= -.3 && p.x <= g.width + .3 && p.y <= g.height + .3, `${label}: clipped ${route.name}`);
          for (const [key, r] of entries) assert(!(p.x > r.left + .35 && p.x < r.right - .35 && p.y > r.top + .35 && p.y < r.bottom - .35), `${label}: ${route.name} runs inside ${key}`);
        }
      }
      if (checkCrossings) for (let i = 0; i < g.paths.length; i++) for (let j = i + 1; j < g.paths.length; j++) {
        const a = g.paths[i], b = g.paths[j];
        for (let x = 1; x < a.samples.length; x++) for (let y = 1; y < b.samples.length; y++) assert(!intersects(a.samples[x - 1], a.samples[x], b.samples[y - 1], b.samples[y]), `${label}: crossing ${a.name} and ${b.name}`);
      }
      assert(Math.abs((g.nodes.grid.right - g.nodes.grid.left) - (g.nodes.grid.bottom - g.nodes.grid.top)) < .3, `${label}: grid must be square`);
      return g;
    };
    for (const width of [320, 390, 768, 1150]) {
      await page.setViewportSize({ width, height: 900 });
      for (let count = 0; count <= 6; count++) { await page.evaluate(count => setCount(count), count); const g = await verify(`${width}px / ${count} consumers`, count); if (width === 390) assert(g.height <= 410, `Compact side flow became too tall: ${JSON.stringify({height:g.height,nodes:g.nodes})}`); }
    }
    await page.setViewportSize({ width: 390, height: 900 });
    await page.evaluate(() => { setCount(6); states['binary_sensor.grid'].state = 'off'; refresh(); });
    await verify('grid outage', 6);
    assert(await page.evaluate(() => { const n = card._nodes.grid, message = n.querySelector('.grid-outage'), r = message.getBoundingClientRect(), box = n.getBoundingClientRect(); return !message.hidden && message.textContent === 'Мережі немає' && r.left >= box.left && r.right <= box.right && r.bottom <= box.bottom && card._values['grid.output'].parentElement.hidden && card._data.home.source === 'grid'; }), 'Outage message does not fit or changed source logic');
    await page.evaluate(() => { states['binary_sensor.grid'].state = 'on'; refresh(); });
    assert(await page.evaluate(() => card._nodes.grid.querySelector('.grid-outage').hidden && !card._values['grid.output'].parentElement.hidden), 'Grid output did not return');
    await settled();
    if (process.env.SURIS_SIDEFLOW_SCREENSHOT) await page.locator('suris-ecoflow-flow-card').screenshot({ path: process.env.SURIS_SIDEFLOW_SCREENSHOT });
    const longName = 'Холодильник на кухні з додатковою морозильною камерою';
    await page.evaluate(name => { config.consumers[0].name = name; card.setConfig(config); refresh(); }, longName);
    await verify('long consumer title', 6);
    assert(await page.evaluate(name => { const h = card._consumerNodes.get('boiler').querySelector('h3'); return h.textContent !== name && h.textContent.endsWith('..') && h.title === name; }, longName), 'Long title was not truncated with two dots');
    await page.setViewportSize({ width: 320, height: 900 }); await verify('long title on narrow screen', 6);
    const narrowTitle = await page.evaluate(() => card._consumerNodes.get('boiler').querySelector('h3').textContent);
    await page.setViewportSize({ width: 390, height: 900 }); await verify('long title resized', 6);
    assert((await page.evaluate(() => card._consumerNodes.get('boiler').querySelector('h3').textContent)).length > narrowTitle.length, 'Title did not expand when space increased');
    await page.locator('.layout-switch').click(); await settled();
    assert.equal(await page.evaluate(() => card._consumerNodes.get('boiler').querySelector('h3').textContent), longName, 'Classic title was not restored');
    await page.locator('.layout-switch').click(); await page.setViewportSize({ width: 390, height: 900 }); await verify('truncation after view switch', 6);
    await page.evaluate(() => { config.consumers[0].name = 'Бойлер'; card.setConfig(config); refresh(); });
    for (const style of ['dashes', 'dots', 'arrows', 'pulse', 'single_dot']) {
      await page.evaluate(style => { card.setConfig({ ...config, appearance: { layout: 'sideflow', animation: style } }); refresh(); }, style);
      await verify(style, 6, false);
      const flows = await page.evaluate(() => Object.values(card._flows).filter(f => f.dataset.flow.startsWith('home_consumer_')).map(f => ({ count: f._animations.length, state: f._animation?.playState, particles: f.querySelectorAll('.flow-particle').length, direct: f._direct, start: f.querySelector('.flow-dashes').getAttribute('d'), motion: f.querySelector('.motion-route')?.getAttribute('d') })));
      for (const f of flows) { assert(f.direct && f.count > 0 && f.state === 'running', `${style}: direct consumer is not animated`); if (style === 'single_dot') assert.equal(f.particles, 1); if (f.motion) assert.equal(f.motion, f.start, `${style}: animation does not span the full connection`); }
    }
    const before = await page.evaluate(() => JSON.stringify(card._data));
    await page.locator('.layout-switch').click(); await settled();
    assert.equal(await page.evaluate(() => card._layout), 'classic');
    assert.equal(await page.evaluate(() => JSON.stringify(card._data)), before, 'Layout switch changed sensor data');
    assert.equal(await page.evaluate(() => Object.keys(card._flows).length), 15, 'Classic shared rows not restored');
    await page.locator('.layout-switch').click(); await verify('switch back', 6);
    await page.locator('.layout-switch').click();
    await page.evaluate(() => { const replacement = document.createElement('suris-ecoflow-flow-card'); replacement.setConfig(config); replacement.hass = { states }; card.replaceWith(replacement); window.card = replacement; });
    assert.equal(await page.evaluate(() => card._layout), 'classic', 'View preference did not survive reconstruction');
    await page.evaluate(() => { card.setConfig({ ...config, appearance: { layout: 'classic', show_layout_switch: false } }); });
    assert(await page.evaluate(() => card.shadowRoot.querySelector('.layout-switch').hidden), 'Cannot hide switch');
    await page.evaluate(() => { card.setConfig({ ...config, appearance: { layout: 'sideflow' } }); if(card._layout !== 'sideflow') card._toggleLayout(); states['sensor.m_out'].state = '1300'; states['sensor.a_out'].state = '400'; states['sensor.b_out'].state = '600'; refresh(); });
    assert.equal(await page.evaluate(() => card._data.home.source), 'main');
    await verify('EcoFlow supplies home', 6);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => Object.values(card._flows).every(f => f._animations.every(a => a.playState === 'paused')));
    assert(await page.evaluate(() => Object.values(card._flows).every(f => f._animations.every(a => a.playState === 'paused'))), 'Reduced motion not respected');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => card.remove());
    assert(await page.evaluate(() => Object.values(card._flows).every(f => f._animations.every(a => a.playState === 'paused'))), 'Detached card animations still running');
    assert.deepEqual(errors, []);
    console.log('PASS: side flow at 320–1150 px and 0–6 consumers, grid/home icons and matching power fonts, equal wider consumer rectangles with preserved heights, single-line titles with two-dot truncation, smaller power fonts, square grid outage, hidden inactive lines, complete noncrossing routes, readable text, five animations, unchanged source logic, classic switch and preference, reduced motion and cleanup.');
  } finally { await browser.close(); }
})().then(() => server.close(), error => { console.error(error); server.close(); process.exitCode = 1; });
