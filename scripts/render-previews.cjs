// Render the released card with demonstration states; no production device access.
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const mdi = require('@mdi/js');
const root = path.resolve(__dirname, '..');
const fontRoot = path.dirname(require.resolve('@fontsource-variable/roboto'));
const iconPaths = { 'mdi:water-boiler': mdi.mdiWaterBoiler, 'mdi:kettle': mdi.mdiKettle, 'mdi:washing-machine': mdi.mdiWashingMachine, 'mdi:fridge': mdi.mdiFridge, 'mdi:lightbulb': mdi.mdiLightbulb, 'mdi:power-socket-eu': mdi.mdiPowerSocketEu };
const server = http.createServer((req, res) => {
  if (req.url === '/card.js') { res.setHeader('Content-Type', 'text/javascript; charset=utf-8'); res.end(fs.readFileSync(path.join(root, 'suris-ecoflow-flow-card.js'))); }
  else if (req.url === '/font.css') { res.setHeader('Content-Type', 'text/css'); res.end(fs.readFileSync(path.join(fontRoot, 'wght.css'))); }
  else if (/^\/files\/roboto-[a-z-]+\.woff2$/.test(req.url)) { res.setHeader('Content-Type', 'font/woff2'); res.end(fs.readFileSync(path.join(fontRoot, req.url.slice(1)))); }
  else { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end('<!doctype html><html><head><link rel="stylesheet" href="/font.css"><style>body{margin:20px;background:#12151c;color:#e9edf5;font:400 16px/1.5 "Roboto Variable",sans-serif;--ha-card-background:#1d232d;--primary-text-color:#e9edf5;--secondary-text-color:#aeb8c8;--divider-color:#516075}#host{width:390px}body.light{background:linear-gradient(135deg,#f3f5fa,#c9d9fa);color:#192a44;--ha-card-background:rgba(255,255,255,.58);--primary-text-color:#192a44;--secondary-text-color:#516278;--divider-color:#b2bfd2}</style></head><body><div id="host"></div><script src="/card.js"></script></body></html>'); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.SURIS_CHROMIUM_PATH ? { executablePath: process.env.SURIS_CHROMIUM_PATH, args: ['--no-sandbox', '--no-zygote', '--disable-dev-shm-usage'] } : {}) });
  try {
    for (const language of ['uk', 'en']) for (const shot of [
      { name: 'sideflow-grid', layout: 'sideflow', mode: 'grid', theme: 'dark', animation: 'dots' },
      { name: 'classic-grid', layout: 'classic', mode: 'grid', theme: 'dark', animation: 'arrows' },
      { name: 'sideflow-main', layout: 'sideflow', mode: 'main', theme: 'dark', animation: 'arrows' },
      { name: 'sideflow-outage', layout: 'sideflow', mode: 'outage', theme: 'light', animation: 'single_dot' }
    ]) {
      const page = await browser.newPage({ viewport: { width: 430, height: 1000 }, deviceScaleFactor: 2 });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(({ iconPaths, language, shot }) => {
        window.previewIcons = iconPaths;
        customElements.define('ha-svg-icon', class extends HTMLElement {
          connectedCallback() { if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host{display:var(--ha-icon-display,inline-flex);align-items:center;justify-content:center;position:relative;vertical-align:middle;fill:var(--icon-primary-color,currentColor);width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)}svg{width:100%;height:100%;pointer-events:none;display:block}</style><svg viewBox="0 0 24 24"><path/></svg>'; }
        });
        customElements.define('ha-icon', class extends HTMLElement {
          static get observedAttributes() { return ['icon']; }
          connectedCallback() { if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host{fill:currentColor}</style><ha-svg-icon></ha-svg-icon>'; this.updatePath(); }
          attributeChangedCallback() { if (this.isConnected) this.updatePath(); }
          updatePath() { this.shadowRoot?.querySelector('ha-svg-icon')?.shadowRoot?.querySelector('path')?.setAttribute('d', previewIcons[this.getAttribute('icon')] || previewIcons['mdi:power-socket-eu']); }
        });
        document.body.classList.toggle('light', shot.theme === 'light');
        const s = (value, unit = 'W') => ({ state: String(value), attributes: { unit_of_measurement: unit } });
        const names = language === 'uk' ? ['Бойлер', 'Чайник', 'Пральна', 'Холодильник', 'Освітлення', 'Розетки'] : ['Boiler', 'Kettle', 'Washer', 'Fridge', 'Lights', 'Sockets'];
        const devices = [['boiler', 'mdi:water-boiler', '#e95478', 1000], ['kettle', 'mdi:kettle', '#ffb21c', 600], ['washer', 'mdi:washing-machine', '#9b72f7', 250], ['fridge', 'mdi:fridge', '#21bbc7', 120], ['lights', 'mdi:lightbulb', '#47bd79', 80], ['sockets', 'mdi:power-socket-eu', '#7a96f0', 50]];
        const grid = shot.mode === 'grid', transfer = shot.mode === 'main';
        const states = { 'sensor.grid': s(grid ? 2700 : 0), 'binary_sensor.grid': s(grid ? 'on' : 'off'), 'sensor.a_soc': s(68, '%'), 'sensor.b_soc': s(81, '%'), 'sensor.m_soc': s(80, '%'), 'sensor.a_in': s(grid ? 200 : 0), 'sensor.b_in': s(grid ? 100 : 0), 'sensor.a_out': s(transfer ? 350 : 0), 'sensor.b_out': s(transfer ? 300 : 0), 'sensor.m_in': s(grid ? 300 : transfer ? 650 : 0), 'sensor.m_ac': s(grid ? 300 : 0), 'sensor.m_pv1': s(transfer ? 350 : 0), 'sensor.m_pv2': s(transfer ? 300 : 0), 'sensor.m_out': s(grid ? 0 : 2100), 'sensor.voltage': s(grid ? 230 : 228, 'V') };
        devices.forEach(([id, , , watts]) => states[`sensor.${id}`] = s(watts));
        const config = { type: 'custom:suris-ecoflow-flow-card', title: language === 'uk' ? 'Енергопотоки' : 'Energy flows', language, grid: { name: language === 'uk' ? 'Міська мережа' : 'City grid', power: 'sensor.grid', available_entity: 'binary_sensor.grid', available_state: 'on' }, auxiliary_1: { name: 'DELTA Max', soc: 'sensor.a_soc', input_power: 'sensor.a_in', output_power: 'sensor.a_out' }, auxiliary_2: { name: 'RIVER Max', soc: 'sensor.b_soc', input_power: 'sensor.b_in', output_power: 'sensor.b_out' }, main: { name: 'DELTA 2 Max', soc: 'sensor.m_soc', input_power: 'sensor.m_in', output_power: 'sensor.m_out', ac_input_power: 'sensor.m_ac', solar_input_power: 'sensor.m_pv1', solar_input_power_2: 'sensor.m_pv2' }, home: { name: language === 'uk' ? 'Дім' : 'Home', voltage: 'sensor.voltage' }, consumers: devices.map(([id, icon, color], i) => ({ id, name: names[i], icon, color, power: `sensor.${id}` })), appearance: { layout: shot.layout, animation: shot.animation, duration: 3, dot_size: 5, auxiliary_2_color: '#ff941e' } };
        window.card = document.createElement('suris-ecoflow-flow-card'); card.setConfig(config); card.hass = { states }; document.querySelector('#host').append(card);
      }, { iconPaths, language, shot });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.evaluate(() => { card._drawPaths(); for (const flow of Object.values(card._flows)) flow._animations.forEach((a, i, list) => { a.pause(); a.currentTime = 1000 * (i + .5) / list.length; }); for (const border of Object.values(card._borders)) { border._animation.pause(); border._animation.currentTime = 250; } card.shadowRoot.querySelector('.grid-outage').getAnimations().forEach(a => { a.pause(); a.currentTime = 0; }); });
      const actual = await page.evaluate(() => {
        const d = card._diagram.getBoundingClientRect();
        return { consumers: card._consumerNodes.size, source: card._data.home.source, homePower: card._data.home.power, charging: card._data.grid.output, outage: card._nodes.grid.classList.contains('grid-absent'), outside: [...card.shadowRoot.querySelectorAll('.node')].some(n => { const r = n.getBoundingClientRect(); return r.left < d.left - .5 || r.right > d.right + .5 || r.top < d.top - .5 || r.bottom > d.bottom + .5; }), missingIcons: [...card.shadowRoot.querySelectorAll('.consumer ha-icon')].some(n => !n.shadowRoot?.querySelector('ha-svg-icon')?.shadowRoot?.querySelector('path')?.getAttribute('d')), fontLoaded: document.fonts.check('400 16px "Roboto Variable"') };
      });
      assert.equal(actual.consumers, 6); assert.equal(actual.source, shot.mode === 'grid' ? 'grid' : 'main'); assert.equal(actual.homePower, 2100); assert.equal(actual.outage, shot.mode !== 'grid'); assert(!actual.outside && !actual.missingIcons && actual.fontLoaded); assert.deepEqual(errors, []);
      const filename = `preview-${shot.name}-${language}.png`;
      await page.locator('suris-ecoflow-flow-card').screenshot({ path: path.join(root, filename) });
      console.log(`${filename}: six consumers, ${actual.source}, 2100 W, native card render verified`);
      await page.close();
    }
  } finally { await browser.close(); }
})().then(() => server.close(), error => { console.error(error); server.close(); process.exitCode = 1; });
