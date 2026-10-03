/* Suris EcoFlow Flow Card v0.1.1 | MIT | No external dependencies. */
(() => {
  'use strict';
  const TAG = 'suris-ecoflow-flow-card';
  const VERSION = '0.1.1';
  const NS = 'http://www.w3.org/2000/svg';
  const DEFAULTS = {
    type: `custom:${TAG}`, title: 'Енергопотоки', language: 'uk',
    grid: { name: 'Міська мережа' },
    auxiliary_1: { name: 'EcoFlow №2' }, auxiliary_2: { name: 'EcoFlow №3' },
    main: { name: 'Головна EcoFlow' },
    home: { name: 'Дім', grid_state: 'on', main_state: 'off' },
    appearance: { grid_color: '#4b9fff', solar_color: '#ffcc42', main_color: '#27d9d5', threshold: 3, duration: 3 }
  };
  const TEXT = {
    uk: { grid: 'Міська мережа', main: 'Головна EcoFlow', home: 'Дім', title: 'Енергопотоки', input: 'Вхід', output: 'Вихід', soc: 'Заряд', ac: 'Мережа', solar: 'Сонячний', power: 'Споживання', source: 'Джерело', unknown: 'Невідомо', unavailable: 'Недоступно', select: 'Вибери сутності в редакторі картки', settings: 'Налаштування', homePowerLabel: 'Споживання дому (необов’язково)', homeDerived: 'Без окремого датчика: від мережі — загальна потужність мінус заряджання трьох станцій; від EcoFlow — вихід головної станції. Для розрахунку від мережі потрібні всі три потужності заряджання. ≈ означає розрахункове значення.', sourceHint: 'Джерело живлення дому визначається окремою сутністю. Її стан має точно збігатися зі значеннями нижче. Наявність міської мережі не визначає положення перемикача.', flowHint: 'На лініях лише анімація. Потік активний, коли потужність перевищує поріг. Відсутні або недоступні показники відображаються як —.', mainHint: 'Для лінії мережа → головна EcoFlow потрібна окрема потужність AC-входу. Загальний вхід не використовується як AC-вхід.', auxHint: 'Потужність передачі на головну станцію: вибери DC-вихід, якщо загальний вихід включає інші навантаження. Якщо поле порожнє, використовується загальний вихід.', editorError: 'Редактор Home Assistant ще завантажується. Закрий та відкрий редактор картки ще раз.', more: 'Докладніше', watts: 'Вт', mismatch: 'Стан джерела не розпізнано', setup: 'Потрібно вибрати джерело живлення дому' },
    en: { grid: 'City grid', main: 'Main EcoFlow', home: 'Home', title: 'Energy flows', input: 'Input', output: 'Output', soc: 'Charge', ac: 'Grid', solar: 'Solar', power: 'Consumption', source: 'Source', unknown: 'Unknown', unavailable: 'Unavailable', select: 'Select entities in the card editor', settings: 'Settings', homePowerLabel: 'Home consumption (optional)', homeDerived: 'Without a separate sensor: grid power minus the three station charging powers when on grid; main station output when on EcoFlow. All three charging readings are required for grid calculation. ≈ marks an estimated value.', sourceHint: 'Select the entity that reports the actual home power source. Its state must exactly match one of the values below. Grid availability does not determine the transfer switch position.', flowHint: 'Lines show animation only. A flow is active above the threshold. Missing or unavailable readings appear as —.', mainHint: 'A separate AC input power entity is required for grid → main EcoFlow. Total input is never treated as AC input.', auxHint: 'Transfer power: use DC output if total output includes other loads. When empty, total output is used.', editorError: 'The Home Assistant editor is still loading. Close and reopen the card editor.', more: 'More information', watts: 'W', mismatch: 'Unrecognized source state', setup: 'Select the home power source entity' }
  };
  const t = (config) => TEXT[config?.language] || TEXT.uk;
  const merge = (config = {}) => {
    const result = { ...DEFAULTS, ...config };
    for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main', 'home', 'appearance']) {
      if (config[key] != null && (typeof config[key] !== 'object' || Array.isArray(config[key]))) throw new Error(`${key} must be an object`);
      result[key] = { ...DEFAULTS[key], ...config[key] };
    }
    const a = result.appearance;
    a.threshold = Number(a.threshold); a.duration = Number(a.duration);
    if (!Number.isFinite(a.threshold) || a.threshold < 0) throw new Error('Flow threshold must be a non-negative number');
    if (!Number.isFinite(a.duration) || a.duration < 0.5 || a.duration > 20) throw new Error('Animation duration must be between 0.5 and 20 seconds');
    for (const key of ['grid_color', 'solar_color', 'main_color']) {
      if (!/^#[0-9a-f]{6}$/i.test(a[key])) throw new Error(`${key} must be a six-digit hex color`);
    }
    if (result.home.grid_state === result.home.main_state) throw new Error('Grid and main source states must differ');
    return result;
  };
  const readNumber = (states, id, power = false) => {
    const state = id && states?.[id];
    if (!state || state.state == null || String(state.state).trim() === '') return null;
    const value = Number(state.state);
    if (!Number.isFinite(value)) return null;
    if (!power) return value;
    const unit = String(state.attributes?.unit_of_measurement || 'W').trim();
    const factors = { W: 1, kW: 1000, mW: 0.001, MW: 1000000, 'Вт': 1, 'кВт': 1000 };
    return factors[unit] == null ? null : value * factors[unit];
  };
  const model = (config, states = {}) => {
    const c = config, p = (id) => readNumber(states, id, true);
    const station = (s) => ({ input: p(s.input_power), output: p(s.output_power), soc: readNumber(states, s.soc) });
    const main = station(c.main), auxiliary_1 = station(c.auxiliary_1), auxiliary_2 = station(c.auxiliary_2);
    main.ac = p(c.main.ac_input_power); main.solar = p(c.main.solar_input_power);
    if (!c.main.input_power && main.ac != null && main.solar != null) main.input = main.ac + main.solar;
    const sourceState = c.home.source_entity && states[c.home.source_entity]?.state;
    const usableSource = sourceState != null && !['unknown', 'unavailable', ''].includes(String(sourceState));
    const source = usableSource && String(sourceState) === String(c.home.grid_state) ? 'grid'
      : usableSource && String(sourceState) === String(c.home.main_state) ? 'main' : 'unknown';
    const gridAvailable = !c.grid.available_entity || states[c.grid.available_entity]?.state === String(c.grid.available_state || 'on');
    const feedPower = p(c.main.home_feed_power || c.main.output_power);
    const gridCharging = [
      p(c.auxiliary_1.grid_charge_power || c.auxiliary_1.input_power),
      p(c.auxiliary_2.grid_charge_power || c.auxiliary_2.input_power),
      main.ac
    ];
    let homePower = p(c.home.power);
    let powerOrigin = c.home.power ? 'sensor' : 'unknown';
    if (!c.home.power && source === 'main') {
      homePower = feedPower; powerOrigin = 'main_output';
    } else if (!c.home.power && source === 'grid') {
      const gridPower = p(c.grid.power);
      if (gridPower != null && gridPower >= 0 && gridCharging.every(value => value != null && value >= 0)) {
        homePower = Math.max(0, gridPower - gridCharging.reduce((sum, value) => sum + value, 0));
        powerOrigin = 'grid_balance';
      }
    }
    const positive = (value) => value != null && value > c.appearance.threshold;
    const solarReceiving = !c.main.solar_input_power || positive(main.solar);
    const flows = {
      grid_auxiliary_1: gridAvailable && positive(p(c.auxiliary_1.grid_charge_power || c.auxiliary_1.input_power)),
      grid_auxiliary_2: gridAvailable && positive(p(c.auxiliary_2.grid_charge_power || c.auxiliary_2.input_power)),
      grid_main: gridAvailable && positive(main.ac),
      auxiliary_1_main: solarReceiving && positive(p(c.auxiliary_1.transfer_power || c.auxiliary_1.output_power)),
      auxiliary_2_main: solarReceiving && positive(p(c.auxiliary_2.transfer_power || c.auxiliary_2.output_power)),
      grid_home: gridAvailable && source === 'grid' && positive(homePower),
      main_home: source === 'main' && positive(homePower)
    };
    return { main, auxiliary_1, auxiliary_2, grid: { output: p(c.grid.power) }, home: { power: homePower, source, power_origin: powerOrigin }, flows };
  };
  const icon = (kind) => {
    const paths = {
      battery: '<rect x="13" y="13" width="38" height="45" rx="4"/><path d="M25 13V7h14v6"/><rect class="battery-fill" x="19" y="33" width="26" height="19" rx="1"/>',
      grid: '<path d="M32 5L13 59M32 5l19 54M20 38h24M24 26h16M28 15h8M10 26h44M7 38h50M15 59h34M20 38l24 14M44 38L20 52M24 26l20 12M40 26L20 38"/>',
      home: '<path d="M7 30L32 8l25 22M15 25v32h34V25"/><path d="M26 57V39h12v18"/>'
    };
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${paths[kind]}</svg>`;
  };
  const CSS = `
    :host{display:block;--flow-grid:#4b9fff;--flow-solar:#ffcc42;--flow-main:#27d9d5}
    *{box-sizing:border-box}ha-card{display:block;overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#1c1c1c));color:var(--primary-text-color,#e8e8e8);padding:16px;border-radius:var(--ha-card-border-radius,16px)}
    .wrap{container-type:inline-size}h2{font-size:22px;font-weight:600;margin:0 0 8px}.diagram{position:relative;height:clamp(470px,65cqw,720px)}
    .lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
    .flow path{fill:none;stroke:var(--divider-color,#60656d);stroke-width:2;opacity:.58}.flow.active path{stroke:var(--color);opacity:.92}.flow circle{fill:var(--color);visibility:hidden}.flow.active circle{visibility:visible}
    .node{position:absolute;display:flex;flex-direction:column;justify-content:center;gap:7px;min-width:0;background:var(--ha-card-background,var(--card-background-color,#1c1c1c));border:2px solid var(--divider-color,#60656d);border-radius:12px;padding:12px 10px;z-index:1;min-height:max(140px,22cqw);height:auto}
    .node h3{font-size:clamp(12px,1.9cqw,20px);line-height:1.25;text-align:center;margin:0;font-weight:600;overflow-wrap:anywhere}.node .icon{display:flex;justify-content:center;height:clamp(30px,5cqw,56px);margin:4px 0}.icon svg{height:100%;width:64px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.icon .battery-fill{fill:var(--flow-main);stroke:none}
    .row{display:flex;align-items:baseline;justify-content:space-between;gap:4px;font-size:clamp(11px,1.6cqw,17px);line-height:1.35;min-width:0}.label{color:var(--secondary-text-color,#aaa);overflow-wrap:anywhere}.value{font:inherit;color:inherit;font-weight:600;text-align:right;white-space:nowrap;background:none;border:0;padding:0;min-width:0}.value[data-entity]{cursor:pointer}.value:focus-visible{outline:2px solid var(--flow-main);outline-offset:2px}.value:disabled{opacity:1}.source .value{white-space:normal;overflow-wrap:anywhere}
    .grid{left:0;top:37%;width:22%}.home{right:0;top:37%;width:22%}.auxiliary_1{left:29%;top:3%;width:22%}.auxiliary_2{left:55%;top:3%;width:22%}.main{left:36%;bottom:1%;width:28%;min-height:max(220px,28cqw);border-color:var(--flow-main)}
    .status{margin-top:8px;color:var(--secondary-text-color,#aaa);font-size:12px;min-height:16px;text-align:center}.status:empty{display:none}
    @container(max-width:520px){.diagram{height:500px}.node{padding:8px 5px;gap:6px;border-radius:9px;min-height:137px}.node h3{font-size:12px}.node .icon{height:29px;margin:0}.row{font-size:11px;flex-wrap:wrap;gap:0 3px}.row .value{margin-left:auto}.grid,.home{width:24%;top:38%}.auxiliary_1{left:26%;width:25%;top:5%}.auxiliary_2{left:54%;width:25%;top:5%}.main{left:33%;width:34%;min-height:202px}.source .label{width:100%}}
    @media(prefers-reduced-motion:reduce){.flow circle{display:none}.flow.active path{stroke-width:3}}
  `;
  class SurisEcoFlowFlowCard extends HTMLElement {
    constructor() {
      super(); this.attachShadow({ mode: 'open' }); this._states = {}; this._signature = '';
      this._resize = new ResizeObserver(() => this._drawPaths());
    }
    static async getConfigElement() {
      await ensureForm();
      return document.createElement(`${TAG}-editor`);
    }
    static getStubConfig() { return JSON.parse(JSON.stringify(DEFAULTS)); }
    setConfig(config) {
      this._config = merge(config); this._signature = ''; this._build(); this._update();
    }
    set hass(hass) { this._hass = hass; this._states = hass?.states || {}; this._update(); }
    get hass() { return this._hass; }
    connectedCallback() {
      const event = new CustomEvent('context-request', { bubbles: true, composed: true, cancelable: true });
      event.context = 'states'; event.subscribe = true;
      event.callback = (states, unsubscribe) => { this._unsubscribe = unsubscribe; this._states = states || {}; this._update(); };
      this.dispatchEvent(event);
      if (this._diagram) { this._resize.observe(this._diagram); for (const node of Object.values(this._nodes)) this._resize.observe(node); }
      this._drawPaths();
    }
    disconnectedCallback() { this._resize.disconnect(); this._unsubscribe?.(); this._unsubscribe = undefined; }
    getCardSize() { return Math.ceil((this.getBoundingClientRect().height || 580) / 50); }
    getGridOptions() { return { columns: 12, min_columns: 12 }; }
    _row(node, field, label) {
      const row = document.createElement('div'); row.className = `row ${field}`;
      const caption = document.createElement('span'); caption.className = 'label'; caption.textContent = label;
      const value = document.createElement('button'); value.className = 'value'; value.type = 'button';
      value.addEventListener('click', () => {
        if (value.dataset.entity) this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: value.dataset.entity } }));
      });
      row.append(caption, value); node.append(row); this._values[`${node.dataset.key}.${field}`] = value;
    }
    _build() {
      const c = this._config, text = t(c); this._resize.disconnect();
      this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="wrap"><h2></h2><div class="diagram"><svg class="lines" aria-hidden="true"></svg></div><div class="status" role="status"></div></div></ha-card>`;
      this.shadowRoot.querySelector('h2').textContent = c.title;
      this._diagram = this.shadowRoot.querySelector('.diagram'); this._svg = this.shadowRoot.querySelector('.lines');
      this._nodes = {}; this._values = {}; this._flows = {};
      this.style.setProperty('--flow-grid', c.appearance.grid_color); this.style.setProperty('--flow-solar', c.appearance.solar_color); this.style.setProperty('--flow-main', c.appearance.main_color);
      for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main', 'home']) {
        const node = document.createElement('section'); node.className = `node ${key}`; node.dataset.key = key;
        const heading = document.createElement('h3'); heading.textContent = c[key].name || text[key] || key;
        const artwork = document.createElement('div'); artwork.className = 'icon'; artwork.innerHTML = icon(key === 'grid' ? 'grid' : key === 'home' ? 'home' : 'battery');
        node.append(heading, artwork);
        if (key === 'grid') this._row(node, 'output', text.output);
        else if (key === 'home') { this._row(node, 'power', text.power); this._row(node, 'source', text.source); }
        else {
          this._row(node, 'soc', text.soc); this._row(node, 'input', text.input);
          if (key === 'main') { this._row(node, 'ac', text.ac); this._row(node, 'solar', text.solar); }
          this._row(node, 'output', text.output);
        }
        this._nodes[key] = node; this._diagram.append(node);
      }
      if (this.isConnected) { this._resize.observe(this._diagram); for (const node of Object.values(this._nodes)) this._resize.observe(node); }
      this._drawPaths();
    }
    _update() {
      if (!this._config || !this._values) return;
      const c = this._config, data = model(c, this._states), text = t(c);
      const signature = JSON.stringify(data) + JSON.stringify(Object.values(c.home).map((id) => this._states[id]?.state));
      if (signature === this._signature) return;
      this._signature = signature; this._data = data;
      const formatter = new Intl.NumberFormat(c.language === 'en' ? 'en' : 'uk', { maximumFractionDigits: 0 });
      for (const [key, button] of Object.entries(this._values)) {
        const [node, field] = key.split('.'); let value = data[node][field];
        let entity = c[node][field === 'soc' ? 'soc' : `${field}_power`];
        if (node === 'grid') entity = c.grid.power;
        if (node === 'home') entity = field === 'source' ? c.home.source_entity : c.home.power;
        if (node === 'main' && field === 'ac') entity = c.main.ac_input_power;
        if (node === 'main' && field === 'solar') entity = c.main.solar_input_power;
        if (field === 'source') value = value === 'grid' ? c.grid.name : value === 'main' ? c.main.name : text.unknown;
        else if (field === 'soc') value = value != null && value >= 0 && value <= 100 ? `${formatter.format(value)}%` : '—';
        else value = value == null ? '—' : `${node === 'home' && data.home.power_origin === 'grid_balance' ? '≈ ' : ''}${formatter.format(value)} ${text.watts}`;
        button.textContent = value;
        if (entity) button.dataset.entity = entity; else delete button.dataset.entity;
        button.disabled = !entity;
        button.title = entity ? `${entity}: ${this._states[entity]?.state ?? text.unavailable}` : node === 'home' && field === 'power' ? text.homeDerived : text.select;
        button.setAttribute('aria-label', `${this._nodes[node].querySelector('h3').textContent}, ${button.previousSibling.textContent}: ${value}`);
      }
      const status = this.shadowRoot.querySelector('.status');
      status.textContent = !c.home.source_entity ? text.setup : data.home.source === 'unknown' ? text.mismatch : '';
      for (const [name, flow] of Object.entries(this._flows)) flow.classList.toggle('active', data.flows[name]);
    }
    _drawPaths() {
      if (!this._diagram || !this.isConnected) return;
      const base = this._diagram.getBoundingClientRect(); if (!base.width || !base.height) return;
      const rect = (key) => { const r = this._nodes[key].getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; };
      const g = rect('grid'), a = rect('auxiliary_1'), b = rect('auxiliary_2'), m = rect('main'), h = rect('home');
      const midY = g.y + g.h / 2;
      const curve = (x, y, xx, yy) => `M ${x} ${y} C ${(x + xx) / 2} ${y}, ${(x + xx) / 2} ${yy}, ${xx} ${yy}`;
      const routes = {
        grid_auxiliary_1: curve(g.x + g.w, g.y + g.h * .23, a.x, a.y + a.h * .42),
        grid_auxiliary_2: `M ${g.x + g.w} ${g.y + g.h * .36} C ${g.x + g.w + 22} ${g.y + g.h * .36}, ${g.x + g.w + 22} 3, ${g.x + g.w + 36} 3 H ${b.x + b.w / 2 - 12} Q ${b.x + b.w / 2} 3, ${b.x + b.w / 2} 15 V ${b.y}`,
        grid_main: curve(g.x + g.w, g.y + g.h * .77, m.x, m.y + m.h * .55),
        grid_home: `M ${g.x + g.w} ${midY} L ${h.x} ${midY}`,
        auxiliary_1_main: `M ${a.x + a.w / 2} ${a.y + a.h} C ${a.x + a.w / 2} ${m.y - 25}, ${m.x + m.w * .32} ${a.y + a.h + 25}, ${m.x + m.w * .32} ${m.y}`,
        auxiliary_2_main: `M ${b.x + b.w / 2} ${b.y + b.h} C ${b.x + b.w / 2} ${m.y - 25}, ${m.x + m.w * .68} ${b.y + b.h + 25}, ${m.x + m.w * .68} ${m.y}`,
        main_home: curve(m.x + m.w, m.y + m.h * .55, h.x, h.y + h.h * .75)
      };
      const geometry = JSON.stringify(routes); if (geometry === this._geometry && this._svg.childElementCount) return;
      this._geometry = geometry; this._svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`); this._svg.replaceChildren(); this._flows = {};
      for (const [name, route] of Object.entries(routes)) {
        const group = document.createElementNS(NS, 'g'); group.classList.add('flow'); group.dataset.flow = name;
        const color = name.startsWith('grid') ? 'grid' : name === 'main_home' ? 'main' : 'solar';
        group.style.setProperty('--color', `var(--flow-${color})`);
        const path = document.createElementNS(NS, 'path'); path.setAttribute('d', route); group.append(path);
        for (let i = 0; i < 3; i++) {
          const circle = document.createElementNS(NS, 'circle'); circle.setAttribute('r', base.width < 500 ? '2.6' : '3.5');
          const motion = document.createElementNS(NS, 'animateMotion');
          motion.setAttribute('path', route); motion.setAttribute('dur', `${this._config.appearance.duration}s`); motion.setAttribute('repeatCount', 'indefinite'); motion.setAttribute('begin', `${-i * this._config.appearance.duration / 3}s`); motion.setAttribute('calcMode', 'paced');
          circle.append(motion); group.append(circle);
        }
        group.classList.toggle('active', !!this._data?.flows[name]); this._flows[name] = group; this._svg.append(group);
      }
    }
  }
  async function ensureForm() {
    if (customElements.get('ha-form')) return;
    try {
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        const element = helpers.createCardElement({ type: 'entities', entities: [] });
        await element.constructor.getConfigElement?.();
      }
    } catch (error) { console.debug(`${TAG}: form preload`, error); }
  }
  const FIELD_LABELS = {
    uk: { title: 'Заголовок', language: 'Мова', name: 'Назва', power: 'Потужність', input_power: 'Загальна вхідна потужність', output_power: 'Загальна вихідна потужність', soc: 'Заряд батареї (%)', ac_input_power: 'Потужність входу від міської мережі (AC)', solar_input_power: 'Потужність сонячного входу (DC)', grid_charge_power: 'Потужність заряджання від мережі (необов’язково)', transfer_power: 'Потужність передачі на головну EcoFlow (необов’язково)', home_feed_power: 'Потужність виходу на дім (необов’язково)', available_entity: 'Наявність міської мережі (необов’язково)', available_state: 'Стан «мережа є»', source_entity: 'Сутність джерела живлення дому', grid_state: 'Стан «дім від міської мережі»', main_state: 'Стан «дім від головної EcoFlow»', grid_color: 'Колір потоків мережі (#RRGGBB)', solar_color: 'Колір передачі між станціями (#RRGGBB)', main_color: 'Колір потоку головна EcoFlow → дім (#RRGGBB)', threshold: 'Поріг активного потоку (Вт)', duration: 'Час проходження точки (с)' },
    en: { title: 'Title', language: 'Language', name: 'Name', power: 'Power', input_power: 'Total input power', output_power: 'Total output power', soc: 'Battery charge (%)', ac_input_power: 'City grid input power (AC)', solar_input_power: 'Solar input power (DC)', grid_charge_power: 'Grid charging power (optional)', transfer_power: 'Transfer power to main EcoFlow (optional)', home_feed_power: 'Output power to home (optional)', available_entity: 'Grid availability (optional)', available_state: 'Grid available state', source_entity: 'Home power source entity', grid_state: 'State: home powered by grid', main_state: 'State: home powered by main EcoFlow', grid_color: 'Grid flow color (#RRGGBB)', solar_color: 'Station transfer color (#RRGGBB)', main_color: 'Main EcoFlow → home color (#RRGGBB)', threshold: 'Active flow threshold (W)', duration: 'Dot travel duration (s)' }
  };
  const entityField = (name, power = true) => ({ name, selector: { entity: power ? { domain: 'sensor' } : {} } });
  const textField = (name) => ({ name, selector: { text: {} } });
  class SurisEcoFlowFlowEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); this._forms = []; }
    setConfig(config) {
      const next = merge(config);
      if (JSON.stringify(next) === JSON.stringify(this._config)) return;
      this._config = next; this._build();
    }
    set hass(hass) { this._hass = hass; for (const form of this._forms) form.hass = hass; }
    get hass() { return this._hass; }
    connectedCallback() { if (this._config && !this._forms.length) this._build(); }
    _build() {
      if (!this._config) return;
      const c = this._config, text = t(c); this._forms = [];
      this.shadowRoot.innerHTML = '<style>:host{display:block}details{border:1px solid var(--divider-color,#777);border-radius:10px;padding:12px;margin:12px 0}summary{cursor:pointer;font-weight:600;padding:4px 0}ha-form{display:block;margin-top:12px}p{font-size:13px;color:var(--secondary-text-color);line-height:1.5}.error{color:var(--error-color,#d44)}</style>';
      if (!customElements.get('ha-form')) {
        const warning = document.createElement('p'); warning.className = 'error'; warning.textContent = text.editorError; this.shadowRoot.append(warning);
        ensureForm().then(() => { if (this.isConnected && customElements.get('ha-form')) this._build(); });
        return;
      }
      const stationSchema = [textField('name'), entityField('soc'), entityField('input_power'), entityField('output_power')];
      const sections = [
        ['', text.settings, [textField('title'), { name: 'language', selector: { select: { options: [{ value: 'uk', label: 'Українська' }, { value: 'en', label: 'English' }], mode: 'dropdown' } } }], ''],
        ['grid', text.grid, [textField('name'), entityField('power'), entityField('available_entity', false), textField('available_state')], ''],
        ['auxiliary_1', c.auxiliary_1.name, [...stationSchema, entityField('grid_charge_power'), entityField('transfer_power')], text.auxHint],
        ['auxiliary_2', c.auxiliary_2.name, [...stationSchema, entityField('grid_charge_power'), entityField('transfer_power')], text.auxHint],
        ['main', text.main, [...stationSchema, entityField('ac_input_power'), entityField('solar_input_power'), entityField('home_feed_power')], text.mainHint],
        ['home', text.home, [textField('name'), entityField('power'), entityField('source_entity', false), textField('grid_state'), textField('main_state')], `${text.sourceHint} ${text.homeDerived}`],
        ['appearance', c.language === 'en' ? 'Flow appearance' : 'Вигляд потоків', [textField('grid_color'), textField('solar_color'), textField('main_color'), { name: 'threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: text.watts } } }, { name: 'duration', selector: { number: { min: .5, max: 20, step: .5, mode: 'box', unit_of_measurement: 's' } } }], text.flowHint]
      ];
      for (const [section, label, schema, hint] of sections) {
        const details = document.createElement('details'); details.open = !section;
        const summary = document.createElement('summary'); summary.textContent = label; details.append(summary);
        if (hint) { const p = document.createElement('p'); p.textContent = hint; details.append(p); }
        const form = document.createElement('ha-form'); form.hass = this._hass; form.schema = schema;
        form.data = section ? c[section] : { title: c.title, language: c.language };
        form.computeLabel = (field) => section === 'home' && field.name === 'power' ? t(this._config).homePowerLabel : (FIELD_LABELS[this._config.language] || FIELD_LABELS.uk)[field.name] || field.name;
        form.addEventListener('value-changed', (event) => {
          event.stopPropagation();
          if (!event.detail?.value) return;
          const previousLanguage = this._config.language;
          const next = section ? { ...this._config, [section]: { ...this._config[section], ...event.detail.value } } : { ...this._config, ...event.detail.value };
          this._config = next; form.data = section ? next[section] : { title: next.title, language: next.language };
          this.dispatchEvent(new CustomEvent('config-changed', { bubbles: true, composed: true, detail: { config: structuredClone(next) } }));
          if (previousLanguage !== next.language) this._build();
        });
        this._forms.push(form); details.append(form); this.shadowRoot.append(details);
      }
    }
  }
  if (!customElements.get(TAG)) customElements.define(TAG, SurisEcoFlowFlowCard);
  if (!customElements.get(`${TAG}-editor`)) customElements.define(`${TAG}-editor`, SurisEcoFlowFlowEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === TAG)) window.customCards.push({ type: TAG, name: 'Suris EcoFlow Flow Card', description: 'City grid, home and three EcoFlow stations. Visual entity editor.', preview: true });
  console.info(`%c SURIS ECOFLOW FLOW CARD %c ${VERSION}`, 'background:#27d9d5;color:#111;padding:4px', 'padding:4px');
})();
