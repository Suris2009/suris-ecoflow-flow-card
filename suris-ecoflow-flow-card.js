/* Suris EcoFlow Flow Card v2.0.5-beta.1 | MIT | No external dependencies. */
(() => {
  'use strict';
  const TAG = 'suris-ecoflow-flow-card';
  const VERSION = '2.0.5-beta.1';
  const NS = 'http://www.w3.org/2000/svg';
  let cardSequence = 0;
  const DEFAULTS = {
    type: `custom:${TAG}`, title: 'Енергопотоки', language: 'uk',
    grid: { name: 'Міська мережа' },
    auxiliary_1: { name: 'EcoFlow №2' }, auxiliary_2: { name: 'EcoFlow №3' },
    main: { name: 'Головна EcoFlow' },
    home: { name: 'Дім' }, consumers: [],
    appearance: { grid_color: '#4b9fff', solar_color: '#ffcc42', main_color: '#27d9d5', threshold: 3, duration: 3 }
  };
  const TEXT = {
    uk: { grid: 'Міська мережа', main: 'Головна EcoFlow', home: 'Дім', title: 'Енергопотоки', input: 'Вхід', output: 'Вихід', soc: 'Заряд', ac: 'Мережа', source: 'Джерело', unknown: 'Невідомо', unavailable: 'Недоступно', select: 'Вибери сутності в редакторі картки', settings: 'Налаштування', homePowerLabel: 'Вхід дому (необов’язково)', homeDerived: 'Без окремого датчика: від мережі — загальна потужність мінус заряджання трьох станцій; від EcoFlow — вихід головної станції. Відсутні або недоступні входи станцій у розрахунку вважаються нулем. Вхід дому від мережі розрахунковий.', sourceHint: 'Мережа є — дім від міської мережі. Мережі немає — дім від головної EcoFlow. Вибери датчик наявності мережі в блоці міської мережі.', flowHint: 'Штрихи без стрілок рухаються від джерела до споживача. Більша потужність кожної лінії — більша швидкість. Більший базовий час — повільніший рух. Потік активний, коли потужність перевищує поріг. Відсутні або недоступні показники відображаються як —.', mainHint: 'Для лінії мережа → головна EcoFlow потрібна окрема потужність AC-входу. Загальний вхід не використовується як AC-вхід.', auxHint: 'Потужність передачі на головну станцію: вибери DC-вихід, якщо загальний вихід включає інші навантаження. Якщо поле порожнє, використовується загальний вихід.', editorError: 'Редактор Home Assistant ще завантажується. Закрий та відкрий редактор картки ще раз.', more: 'Докладніше', watts: 'W', mismatch: 'Стан міської мережі не розпізнано', setup: 'Вибери датчик наявності міської мережі' },
    en: { grid: 'City grid', main: 'Main EcoFlow', home: 'Home', title: 'Energy flows', input: 'Input', output: 'Output', soc: 'Charge', ac: 'Grid', source: 'Source', unknown: 'Unknown', unavailable: 'Unavailable', select: 'Select entities in the card editor', settings: 'Settings', homePowerLabel: 'Home input power (optional)', homeDerived: 'Without a separate sensor: grid power minus the three station charging powers when on grid; main station output when on EcoFlow. Missing or unavailable station inputs count as zero in this calculation. Home input from the grid is calculated.', sourceHint: 'Grid available — home powered by grid. Grid absent — home powered by the main EcoFlow. Select the grid availability sensor in the city grid section.', flowHint: 'Dashes without arrows move from source to load. Higher power on each line increases its speed. A larger base time slows movement. A flow is active above the threshold. Missing or unavailable readings appear as —.', mainHint: 'A separate AC input power entity is required for grid → main EcoFlow. Total input is never treated as AC input.', auxHint: 'Transfer power: use DC output if total output includes other loads. When empty, total output is used.', editorError: 'The Home Assistant editor is still loading. Close and reopen the card editor.', more: 'More information', watts: 'W', mismatch: 'Unrecognized grid availability state', setup: 'Select the grid availability sensor' }
  };
  Object.assign(TEXT.uk, { consumers: 'Індивідуальні споживачі', consumer: 'Споживач', addConsumer: 'Додати споживача', removeConsumer: 'Видалити', consumerPower: 'Датчик потужності (W / kW)', consumerIcon: 'Іконка', consumerColor: 'Колір рамки споживача', consumerHint: 'Додай до 20 приладів. Зверху видно до шести активних із найбільшою потужністю. Поріг активності береться з налаштувань потоків. Потрібен датчик потужності, а не енергії kWh. Колір застосовується до рамки приладу. Спільні лінії рядів мають колір дому. Спочатку заповнюється нижній ряд. Без одного чи обох рядів висота автоматично зменшується.' });
  Object.assign(TEXT.en, { consumers: 'Individual consumers', consumer: 'Consumer', addConsumer: 'Add consumer', removeConsumer: 'Remove', consumerPower: 'Power sensor (W / kW)', consumerIcon: 'Icon', consumerColor: 'Consumer border color', consumerHint: 'Add up to 20 devices. The six active devices with the highest power appear at the top. Activity uses the flow threshold. Select power sensors, not kWh energy sensors. Each device color applies to its border. Shared row lines use the home color. The lower row fills first. Height shrinks automatically when one or both rows are unused.' });
  Object.assign(TEXT.uk, { voltage: 'Напруга' });
  Object.assign(TEXT.en, { voltage: 'Voltage' });
  Object.assign(TEXT.uk, {
    gridOff: 'Мережі немає',
    gridHint: 'Датчик необов’язковий. Якщо мережі немає, усередині її блоку блимає червоний напис «Мережі немає». Без датчика попередження приховане. Цей датчик не керує потоками.',
    sourceHint: 'За виходом головної EcoFlow: потужність виходу на дім вище порогу — дім від EcoFlow, нижче або рівна порогу — від мережі. Датчик мережі керує лише червоним написом та не впливає на потоки. Якщо вихід EcoFlow недоступний, додатна потужність мережі визначає живлення від мережі.',
    sourceUnknown: 'Недостатньо даних потужності для визначення джерела дому',
    mainHint: 'Для лінії мережа → головна EcoFlow потрібна окрема потужність AC-входу. Для визначення джерела дому за виходом вибери вихід на дім; загальний вихід підходить, лише якщо станція живить тільки дім.'
  });
  Object.assign(TEXT.en, {
    gridOff: 'No grid',
    gridHint: 'The sensor is optional. When grid power is absent, a red No grid message pulses inside its block. Without a sensor the warning stays hidden. This sensor never controls flows.',
    sourceHint: 'Main EcoFlow output: home feed power above the threshold selects EcoFlow; at or below the threshold selects grid. The grid sensor only controls the red warning and never affects flows. If EcoFlow output is unavailable, positive grid power selects the grid.',
    sourceUnknown: 'Not enough power data to determine the home source',
    mainHint: 'Grid → main EcoFlow requires a separate AC input sensor. For output-based home source detection, select the home feed output; total output is suitable only when the station supplies the home alone.'
  });
  const t = (config) => TEXT[config?.language] || TEXT.uk;
  const draftConfig = (config = {}) => {
    const result = { ...DEFAULTS, ...config };
    for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main', 'home', 'appearance']) {
      if (config[key] != null && (typeof config[key] !== 'object' || Array.isArray(config[key]))) throw new Error(`${key} must be an object`);
      result[key] = { ...DEFAULTS[key], ...config[key] };
    }
    delete result.home.source_mode; // Legacy source modes never control flows.
    if (config.consumers != null && !Array.isArray(config.consumers)) throw new Error('Consumers must be a list');
    if ((config.consumers || []).length > 20) throw new Error('Maximum 20 consumers');
    const ids = new Set();
    result.consumers = (config.consumers || []).map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Each consumer must be an object');
      let id = String(item.id || `consumer_${index + 1}`), suffix = 1;
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw new Error('Consumer ID must contain letters, numbers, hyphens or underscores');
      while (ids.has(id)) id = `consumer_${index + 1}_${suffix++}`;
      ids.add(id);
      return { ...item, id, name: String(item.name ?? ''), power: String(item.power ?? ''), icon: String(item.icon ?? ''), color: String(item.color ?? '') };
    });
    const a = result.appearance;
    a.auxiliary_1_color ??= a.solar_color;
    a.auxiliary_2_color ??= a.solar_color;
    return result;
  };
  const merge = (config = {}) => {
    const result = draftConfig(config), a = result.appearance;
    result.title ??= DEFAULTS.title;
    result.language = result.language === 'en' ? 'en' : 'uk';
    for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main', 'home']) result[key].name ||= DEFAULTS[key].name;
    const number = (key) => a[key] == null || a[key] === '' ? DEFAULTS.appearance[key] : Number(a[key]);
    a.threshold = number('threshold'); a.duration = number('duration');
    if (!Number.isFinite(a.threshold) || a.threshold < 0) throw new Error('Flow threshold must be a non-negative number');
    if (!Number.isFinite(a.duration) || a.duration < 0.5 || a.duration > 20) throw new Error('Animation duration must be between 0.5 and 20 seconds');
    for (const key of ['grid_color', 'solar_color', 'main_color', 'auxiliary_1_color', 'auxiliary_2_color']) {
      const color = String(a[key] ?? '').trim();
      a[key] = color || (key.startsWith('auxiliary_') ? a.solar_color : DEFAULTS.appearance[key]);
      if (!/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(a[key]) && !globalThis.CSS?.supports('color', a[key])) throw new Error(`${key}: enter a CSS color such as red, #ff0000 or rgb(255, 0, 0)`);
    }
    for (const consumer of result.consumers) {
      consumer.name ||= `${t(result).consumer} ${result.consumers.indexOf(consumer) + 1}`;
      consumer.icon ||= 'mdi:power-plug'; consumer.color = consumer.color.trim() || '#4b9fff';
      if (!/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(consumer.color) && !globalThis.CSS?.supports('color', consumer.color)) throw new Error('Enter a valid consumer CSS color');
    }
    return result;
  };
  const selectConsumers = (consumers, previous = [], threshold = 3) => {
    const previousRank = id => { const index = previous.indexOf(id); return index < 0 ? 100 : index; };
    const ranked = consumers.map((consumer, index) => ({ ...consumer, index })).filter(consumer => Number.isFinite(consumer.power) && consumer.power > threshold)
      .sort((a, b) => b.power - a.power || previousRank(a.id) - previousRank(b.id) || a.index - b.index).slice(0, 6);
    const selected = new Map(ranked.map(consumer => [consumer.id, consumer])), slots = Array(6).fill(null);
    previous.slice(0, 6).forEach((id, slot) => { if (slot < ranked.length && selected.has(id)) { slots[slot] = selected.get(id); selected.delete(id); } });
    for (const consumer of ranked) if (selected.has(consumer.id)) { slots[slots.indexOf(null)] = consumer; selected.delete(consumer.id); }
    return slots;
  };
  const powerText = (value, language) => value == null ? '—' : Math.abs(value) >= 1000
    ? `${new Intl.NumberFormat(language === 'en' ? 'en' : 'uk', { maximumFractionDigits: 2, useGrouping: false }).format(value / 1000)} kW`
    : `${new Intl.NumberFormat(language === 'en' ? 'en' : 'uk', { maximumFractionDigits: 0 }).format(value)} W`;
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
    main.ac = p(c.main.ac_input_power);
    main.solar_1 = p(c.main.solar_input_power);
    main.solar_2 = p(c.main.solar_input_power_2);
    if (!c.main.input_power) {
      const inputs = [c.main.ac_input_power, c.main.solar_input_power, c.main.solar_input_power_2].filter(Boolean).map(p);
      if (inputs.length && inputs.every(value => value != null)) main.input = inputs.reduce((sum, value) => sum + value, 0);
    }
    const positive = (value) => value != null && value > c.appearance.threshold;
    const feedPower = p(c.main.home_feed_power || c.main.output_power), gridPower = p(c.grid.power);
    const gridState = c.grid.available_entity && states[c.grid.available_entity]?.state;
    const availableState = String(c.grid.available_state || 'on');
    const absentState = availableState === 'on' ? 'off' : availableState === 'off' ? 'on' : null;
    const usableGrid = gridState != null && !['unknown', 'unavailable', ''].includes(String(gridState));
    const gridAvailability = !c.grid.available_entity ? 'not_configured'
      : usableGrid && String(gridState) === availableState ? 'available'
        : usableGrid && (absentState ? String(gridState) === absentState : true) ? 'absent' : 'unknown';
    const source = positive(feedPower) ? 'main'
      : (feedPower != null && feedPower >= 0) || positive(gridPower) ? 'grid' : 'unknown';
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
      if (gridPower != null && gridPower >= 0) {
        homePower = Math.max(0, gridPower - gridCharging.reduce((sum, value) => sum + Math.max(0, value ?? 0), 0));
        powerOrigin = 'grid_balance';
      }
    }
    const flow_power = {
      grid_auxiliary_1: gridCharging[0], grid_auxiliary_2: gridCharging[1], grid_main: main.ac,
      auxiliary_1_main: p(c.auxiliary_1.transfer_power || c.auxiliary_1.output_power),
      auxiliary_2_main: p(c.auxiliary_2.transfer_power || c.auxiliary_2.output_power),
      grid_home: homePower, main_home: homePower
    };
    const flows = {
      grid_auxiliary_1: positive(flow_power.grid_auxiliary_1),
      grid_auxiliary_2: positive(flow_power.grid_auxiliary_2),
      grid_main: positive(main.ac),
      auxiliary_1_main: positive(flow_power.auxiliary_1_main),
      auxiliary_2_main: positive(flow_power.auxiliary_2_main),
      grid_home: source === 'grid' && positive(homePower),
      main_home: source === 'main' && positive(homePower)
    };
    return { main, auxiliary_1, auxiliary_2, grid: { output: p(c.grid.power), availability: gridAvailability }, home: { power: homePower, voltage: readNumber(states, c.home.voltage), source, power_origin: powerOrigin }, consumers: (c.consumers || []).map(consumer => ({ ...consumer, entity: consumer.power, power: p(consumer.power) })), flows, flow_power };
  };
  // Equal wattage has equal visual speed, regardless of a route's length.
  const flowSpeed = (watts, duration) => Number.isFinite(watts) && watts > 0
    ? 100 / duration * (.35 + 3.25 * (watts / (watts + 400))) : 0;
  const icon = (kind) => {
    const paths = {
      battery: '<rect x="13" y="13" width="38" height="45" rx="4"/><path d="M25 13V7h14v6"/><rect class="battery-fill" x="19" y="52" width="26" height="0" rx="1"/><path class="battery-unknown" d="M26 35h12"/>',
      grid: '<path d="M32 5L13 59M32 5l19 54M20 38h24M24 26h16M28 15h8M10 26h44M7 38h50M15 59h34M20 38l24 14M44 38L20 52M24 26l20 12M40 26L20 38"/>',
      plug: '<path d="M23 8v16M41 8v16M17 24h30v11a15 15 0 0 1-15 15v10M23 24h18"/>',
      home: '<path d="M7 30L32 8l25 22M15 25v32h34V25"/><path d="M26 57V39h12v18"/>'
    };
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${paths[kind]}</svg>`;
  };
  const CSS = `
    :host{display:block;--flow-grid:#4b9fff;--flow-auxiliary_1:#ffcc42;--flow-auxiliary_2:#ffcc42;--flow-main:#27d9d5}
    *{box-sizing:border-box}ha-card{display:block;overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#1c1c1c));color:var(--primary-text-color,#e8e8e8);padding:16px;border-radius:var(--ha-card-border-radius,16px)}
    .wrap{container-type:inline-size}h2{font-size:22px;font-weight:600;margin:0 0 8px}.diagram{position:relative;height:clamp(540px,65cqw,720px)}
    .lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
    .flow path{fill:none;stroke:color-mix(in srgb,var(--primary-text-color,#9aa0a6) 55%,transparent);stroke-width:1.5;stroke-linejoin:miter;stroke-linecap:butt;opacity:.40}.flow.active .flow-track{stroke:var(--color);opacity:.28}.flow .flow-dashes{stroke:var(--color);stroke-width:3;stroke-linecap:round;stroke-dasharray:7 21;opacity:.95;visibility:hidden}.flow.active .flow-dashes{visibility:visible}
    .node{position:absolute;display:flex;flex-direction:column;justify-content:center;gap:7px;min-width:0;background:transparent;background:color-mix(in srgb,var(--ha-card-background,var(--card-background-color,#1c1c1c)) 8%,transparent);border:2px solid var(--node-color,var(--divider-color,#60656d));border-radius:12px;padding:12px 10px;z-index:1;min-height:140px;height:auto}
    .node.supplying{border-color:transparent}.node-border{position:absolute;overflow:visible;pointer-events:none;display:none;z-index:2}.node-border.active{display:block}.node-border path{fill:none;stroke:var(--node-color);stroke-width:2;stroke-linecap:round;stroke-dasharray:7 7}
    .node h3{font-size:clamp(12px,1.9cqw,20px);line-height:1.25;text-align:center;margin:0;font-weight:600;overflow-wrap:anywhere}.node .icon{display:flex;justify-content:center;height:clamp(30px,5cqw,56px);margin:4px 0}.icon svg{height:100%;width:64px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.icon .battery-fill{fill:var(--node-color,var(--flow-main));stroke:none}
    .row{display:flex;align-items:baseline;justify-content:space-between;gap:4px;flex-wrap:nowrap;font-size:clamp(11px,1.6cqw,17px);line-height:1.35;min-width:0}.label{color:var(--secondary-text-color,#aaa);white-space:nowrap}.value{flex-shrink:0;font:inherit;color:inherit;font-weight:600;text-align:right;white-space:nowrap;background:none;border:0;padding:0;min-width:0}.value[data-entity]{cursor:pointer}.value:focus-visible{outline:2px solid var(--flow-main);outline-offset:2px}.value:disabled{opacity:1}
    .grid{left:0;top:37%;width:22%}.home{right:0;top:37%;width:22%}.auxiliary_1{left:0;bottom:1%;width:25%}.auxiliary_2{right:0;bottom:1%;width:25%}.main{left:36%;bottom:1%;width:28%;min-height:max(220px,28cqw)}
    .status{margin-top:8px;color:var(--secondary-text-color,#aaa);font-size:12px;min-height:16px;text-align:center}.status:empty{display:none}
    @container(max-width:520px){.diagram{height:540px}.node{padding:8px 5px;gap:6px;border-radius:9px;min-height:137px}.node h3{font-size:12px}.node .icon{height:29px;margin:0}.row{font-size:11px;gap:2px}.row .value{margin-left:auto}.grid,.home{width:24%;top:38%}.auxiliary_1{left:0;width:25%;bottom:1%}.auxiliary_2{right:0;width:25%;bottom:1%}.main{left:33%;width:34%;min-height:202px}}
    .node.home{border-width:3px;padding-inline:9px}.row[hidden]{display:none}
    .grid .icon{position:relative}.grid-outage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#ff3b30;font-size:clamp(10px,1.4cqw,14px);font-weight:700;line-height:1.2;text-align:center;animation:grid-outage-pulse 1.8s ease-in-out infinite}.grid-outage[hidden]{display:none}.grid.grid-absent .icon svg{visibility:hidden}
    @keyframes grid-outage-pulse{0%,100%{opacity:1}50%{opacity:.25}}
    @container(max-width:520px){.node.home{padding-inline:4px}}
    .node.consumer{height:72px;min-height:72px;padding:4px;gap:3px;border-radius:9px}.consumer h3{font-size:clamp(11px,1.5cqw,13px);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;overflow-wrap:normal}.consumer .icon{height:22px;margin:0;color:var(--node-color)}.consumer ha-icon{--mdc-icon-size:22px;width:22px;height:22px}.consumer ha-icon:not(:defined){display:none}.consumer ha-icon:defined+.fallback{display:none}.consumer .fallback{height:22px}.consumer .fallback svg{width:22px}.consumer .value{width:100%;text-align:center;font-size:12px;line-height:16px}.consumer:focus-within{outline:1px solid var(--node-color);outline-offset:2px}
    @media(prefers-reduced-motion:reduce){.flow .flow-dashes{display:none}.flow.active .flow-track{stroke-width:3;opacity:.92}.grid-outage{animation:none}}
  `;
  class SurisEcoFlowFlowCard extends HTMLElement {
    constructor() {
      super(); this.attachShadow({ mode: 'open' }); this._states = {}; this._signature = ''; this._maskId = `${TAG}-mask-${++cardSequence}`;
      this._resize = new ResizeObserver(() => this._drawPaths());
      this._reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      this._motionChange = () => this._syncFlows();
    }
    static async getConfigElement() {
      await ensureForm();
      return document.createElement(`${TAG}-editor`);
    }
    static getStubConfig() { return JSON.parse(JSON.stringify(DEFAULTS)); }
    setConfig(config) {
      const next = merge(config);
      if (JSON.stringify(next) === JSON.stringify(this._config)) return;
      const rebuild = !this._nodes || next.language !== this._config?.language;
      this._config = next; this._signature = '';
      if (rebuild) this._build(); else this._applyConfig();
      this._update(); this._drawPaths();
    }
    set hass(hass) { this._hass = hass; this._states = hass?.states || {}; this._update(); }
    get hass() { return this._hass; }
    connectedCallback() {
      this._reducedMotion.addEventListener('change', this._motionChange);
      const event = new CustomEvent('context-request', { bubbles: true, composed: true, cancelable: true });
      event.context = 'states'; event.subscribe = true;
      event.callback = (states, unsubscribe) => { this._unsubscribe = unsubscribe; this._states = states || {}; this._update(); };
      this.dispatchEvent(event);
      if (this._diagram) { this._resize.observe(this._diagram); for (const node of Object.values(this._nodes)) this._resize.observe(node); }
      this._drawPaths();
      this._syncFlows();
    }
    disconnectedCallback() {
      this._resize.disconnect(); this._unsubscribe?.(); this._unsubscribe = undefined;
      this._reducedMotion.removeEventListener('change', this._motionChange);
      for (const flow of Object.values(this._flows || {})) flow._animation?.pause();
      for (const border of Object.values(this._borders || {})) border._animation?.pause();
    }
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
      for (const flow of Object.values(this._flows || {})) flow._animation?.cancel();
      for (const border of Object.values(this._borders || {})) border._animation?.cancel();
      this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="wrap"><h2></h2><div class="diagram"><svg class="lines" aria-hidden="true"></svg></div><div class="status" role="status"></div></div></ha-card>`;
      this.shadowRoot.querySelector('h2').textContent = c.title;
      this._diagram = this.shadowRoot.querySelector('.diagram'); this._svg = this.shadowRoot.querySelector('.lines');
      this._nodes = {}; this._values = {}; this._flows = {}; this._borders = {}; this._consumerNodes = new Map(); this._consumerOrder = [];
      for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main']) this.style.setProperty(`--flow-${key}`, c.appearance[`${key}_color`]);
      for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main', 'home']) {
        const node = document.createElement('section'); node.className = `node ${key}`; node.dataset.key = key;
        if (key !== 'home') node.style.setProperty('--node-color', `var(--flow-${key})`);
        const heading = document.createElement('h3'); heading.textContent = c[key].name || text[key] || key;
        const artwork = document.createElement('div'); artwork.className = 'icon'; artwork.innerHTML = icon(key === 'grid' ? 'grid' : key === 'home' ? 'home' : 'battery');
        node.append(heading, artwork);
        if (key === 'grid') {
          const outage = document.createElement('span'); outage.className = 'grid-outage'; outage.hidden = true;
          outage.textContent = text.gridOff; outage.setAttribute('role', 'status'); artwork.append(outage);
        }
        {
          const border = document.createElementNS(NS, 'svg'); border.classList.add('node-border'); border.setAttribute('aria-hidden', 'true'); border.style.setProperty('--node-color', `var(--flow-${key})`);
          const path = document.createElementNS(NS, 'path'); border.append(path); this._diagram.append(border);
          border._animation = path.animate([{ strokeDashoffset: '0px' }, { strokeDashoffset: '-14px' }], { duration: 1000, iterations: Infinity });
          border._animation.pause(); this._borders[key] = border;
        }
        if (key === 'grid') this._row(node, 'output', text.output);
        else if (key === 'home') {
          this._row(node, 'power', text.input); this._row(node, 'voltage', text.voltage);
          this._values['home.voltage'].parentElement.hidden = !c.home.voltage;
        }
        else {
          this._row(node, 'soc', text.soc); this._row(node, 'input', text.input);
          if (key === 'main') { this._row(node, 'ac', text.ac); this._row(node, 'solar_1', 'XT60(1)'); this._row(node, 'solar_2', 'XT60(2)'); }
          this._row(node, 'output', text.output);
        }
        this._nodes[key] = node; this._diagram.append(node);
      }
      if (this.isConnected) { this._resize.observe(this._diagram); for (const node of Object.values(this._nodes)) this._resize.observe(node); }
      this._drawPaths();
    }
    _applyConfig() {
      const c = this._config, text = t(c);
      this.shadowRoot.querySelector('h2').textContent = c.title;
      for (const key of ['grid', 'auxiliary_1', 'auxiliary_2', 'main']) this.style.setProperty(`--flow-${key}`, c.appearance[`${key}_color`]);
      for (const [key, node] of Object.entries(this._nodes)) node.querySelector('h3').textContent = c[key].name || text[key] || key;
      this._values['home.voltage'].parentElement.hidden = !c.home.voltage;
    }
    _update() {
      if (!this._config || !this._values) return;
      const c = this._config, data = model(c, this._states), text = t(c);
      const signature = JSON.stringify(data) + JSON.stringify(Object.values(c.home).map((id) => this._states[id]?.state));
      if (signature === this._signature) return;
      this._signature = signature; this._data = data;
      const gridAbsent = data.grid.availability === 'absent';
      this._nodes.grid.classList.toggle('grid-absent', gridAbsent);
      this._nodes.grid.querySelector('.grid-outage').hidden = !gridAbsent;
      const formatter = new Intl.NumberFormat(c.language === 'en' ? 'en' : 'uk', { maximumFractionDigits: 0 });
      for (const [key, button] of Object.entries(this._values)) {
        const [node, field] = key.split('.'); let value = data[node][field];
        let entity = c[node][field === 'soc' ? 'soc' : `${field}_power`];
        if (node === 'grid') entity = c.grid.power;
        if (node === 'home') entity = field === 'voltage' ? c.home.voltage : c.home.power;
        if (node === 'main' && field === 'ac') entity = c.main.ac_input_power;
        if (node === 'main' && field === 'solar_1') entity = c.main.solar_input_power;
        if (node === 'main' && field === 'solar_2') entity = c.main.solar_input_power_2;
        if (field === 'soc') value = value != null && value >= 0 && value <= 100 ? `${formatter.format(value)}%` : '—';
        else if (field === 'voltage') value = value != null && value >= 0 ? `${formatter.format(value)} V` : '—';
        else value = powerText(value, c.language);
        button.textContent = value;
        if (entity) button.dataset.entity = entity; else delete button.dataset.entity;
        button.disabled = !entity;
        button.title = entity ? `${entity}: ${this._states[entity]?.state ?? text.unavailable}` : node === 'home' && field === 'power' ? text.homeDerived : text.select;
        button.setAttribute('aria-label', `${this._nodes[node].querySelector('h3').textContent}, ${button.previousSibling.textContent}: ${value}`);
      }
      this._fitRows();
      for (const key of ['auxiliary_1', 'auxiliary_2', 'main']) {
        const soc = data[key].soc, battery = this._nodes[key].querySelector('.icon svg');
        const known = soc != null && soc >= 0 && soc <= 100;
        const height = known ? 33 * soc / 100 : 0;
        const fill = battery.querySelector('.battery-fill');
        fill.setAttribute('height', String(height)); fill.setAttribute('y', String(52 - height));
        battery.querySelector('.battery-unknown').style.display = known ? 'none' : '';
      }
      const status = this.shadowRoot.querySelector('.status');
      status.textContent = data.home.source === 'unknown' ? text.sourceUnknown : '';
      const homeColor = data.home.source === 'unknown' ? 'color-mix(in srgb,var(--primary-text-color,#9aa0a6) 55%,transparent)' : `var(--flow-${data.home.source})`;
      this.style.setProperty('--flow-home', homeColor); this._nodes.home.style.setProperty('--node-color', homeColor); this._borders.home.style.setProperty('--node-color', homeColor);
      this._renderConsumers(); this._drawPaths(); this._syncFlows();
    }
    _renderConsumers() {
      const slots = selectConsumers(this._data.consumers, this._consumerOrder, this._config.appearance.threshold);
      this._consumerOrder = slots.map(consumer => consumer?.id || null);
      const selected = new Set(slots.filter(Boolean).map(consumer => consumer.id));
      for (const [id, node] of this._consumerNodes) if (!selected.has(id)) { node.remove(); this._consumerNodes.delete(id); this.style.removeProperty(`--consumer-${id}`); }
      slots.forEach((consumer, slot) => {
        if (!consumer) return;
        let node = this._consumerNodes.get(consumer.id);
        if (!node) {
          node = document.createElement('section'); node.className = 'node consumer'; node.dataset.key = `consumer:${consumer.id}`;
          const heading = document.createElement('h3'), artwork = document.createElement('div'); artwork.className = 'icon';
          const haIcon = document.createElement('ha-icon'), fallback = document.createElement('span'); fallback.className = 'fallback'; fallback.innerHTML = icon('plug'); artwork.append(haIcon, fallback);
          const value = document.createElement('button'); value.className = 'value'; value.type = 'button';
          value.addEventListener('click', () => { if (value.dataset.entity) this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: value.dataset.entity } })); });
          node.append(heading, artwork, value); this._consumerNodes.set(consumer.id, node); this._diagram.append(node);
        }
        node.dataset.slot = String(slot); node.querySelector('h3').textContent = consumer.name; node.querySelector('h3').title = consumer.name;
        node.querySelector('ha-icon').setAttribute('icon', consumer.icon);
        this.style.setProperty(`--consumer-${consumer.id}`, consumer.color); node.style.setProperty('--node-color', `var(--consumer-${consumer.id})`);
        const value = node.querySelector('.value'); value.textContent = powerText(consumer.power, this._config.language); value.dataset.entity = consumer.entity;
        value.title = `${consumer.entity}: ${this._states[consumer.entity]?.state ?? ''}`; value.setAttribute('aria-label', `${consumer.name}: ${value.textContent}`);
        const name = `home_consumer_${consumer.id}`, row = slot < 3 ? 'home_row_lower' : 'home_row_upper';
        this._data.flows[name] = true; this._data.flow_power[name] = consumer.power;
        this._data.flows[row] = true; this._data.flow_power[row] = (this._data.flow_power[row] || 0) + consumer.power;
      });
    }
    _layoutConsumers() {
      const rows = Math.ceil(this._consumerNodes.size / 3), shift = (2 - rows) * 93;
      const fullHeight = Math.min(720, Math.max(540, this._diagram.clientWidth * .65));
      this._diagram.style.height = `${fullHeight - shift}px`; this._diagram.dataset.consumerRows = String(rows);
      const supplyTop = fullHeight * (this._diagram.clientWidth <= 520 ? .38 : .37) - shift;
      for (const key of ['grid', 'home']) this._nodes[key].style.top = `${supplyTop}px`;
      for (const key of ['main', 'auxiliary_1', 'auxiliary_2']) this._nodes[key].style.bottom = `${fullHeight * .01}px`;
      // Keep room for the charging lane below Home, including multi-line names.
      const requiredHeight = supplyTop + this._nodes.home.offsetHeight + 24 + this._nodes.auxiliary_2.offsetHeight + fullHeight * .01;
      this._diagram.style.height = `${Math.max(fullHeight - shift, requiredHeight)}px`;
      const width = Math.min(130, (this._diagram.clientWidth - 84) / 3), offset = (this._diagram.clientWidth - width * 3 - 64) / 2;
      for (const node of this._consumerNodes.values()) { const slot = Number(node.dataset.slot); Object.assign(node.style, { left: `${offset + (width + 32) * (slot % 3)}px`, top: `${12 + (slot < 3 && rows === 2 ? 1 : 0) * 93}px`, width: `${width}px` }); }
    }
    _syncFlows() {
      if (!this._config) return;
      for (const [name, flow] of Object.entries(this._flows || {})) {
        const active = !!this._data?.flows[name], animation = flow._animation;
        flow.classList.toggle('active', active);
        if (!animation) continue;
        animation.updatePlaybackRate(flowSpeed(this._data?.flow_power[name], this._config.appearance.duration) / 28);
        if (active && this.isConnected && !this._reducedMotion.matches) {
          if (animation.playState !== 'running') animation.play();
        } else if (animation.playState !== 'paused') animation.pause();
      }
      this._syncBorders();
    }
    _syncBorders() {
      for (const [key, border] of Object.entries(this._borders || {})) {
        const outgoing = Object.keys(this._data?.flows || {}).filter(name => name.startsWith(`${key}_`) && this._data.flows[name]);
        const active = key !== 'home' && outgoing.length > 0, animation = border._animation;
        this._nodes[key].classList.toggle('supplying', active); border.classList.toggle('active', active);
        const watts = outgoing.reduce((total, name) => total + this._data.flow_power[name], 0);
        animation.updatePlaybackRate(flowSpeed(watts, this._config.appearance.duration) / 14);
        if (active && this.isConnected && !this._reducedMotion.matches) {
          if (animation.playState !== 'running') animation.play();
        } else if (animation.playState !== 'paused') animation.pause();
      }
    }
    _drawBorders() {
      const base = this._diagram.getBoundingClientRect();
      for (const [key, border] of Object.entries(this._borders || {})) {
        const node = this._nodes[key], { width: w, height: h, left, top } = node.getBoundingClientRect();
        if (!w || !h) continue;
        Object.assign(border.style, { left: `${left - base.left}px`, top: `${top - base.top}px`, width: `${w}px`, height: `${h}px` });
        const r = Math.max(0, Math.min(parseFloat(getComputedStyle(node).borderTopLeftRadius) - 1, (w - 2) / 2, (h - 2) / 2));
        // Begin on the top edge and trace right, down, left, up: clockwise.
        const d = `M ${1 + r} 1 H ${w - 1 - r} A ${r} ${r} 0 0 1 ${w - 1} ${1 + r} V ${h - 1 - r} A ${r} ${r} 0 0 1 ${w - 1 - r} ${h - 1} H ${1 + r} A ${r} ${r} 0 0 1 1 ${h - 1 - r} V ${1 + r} A ${r} ${r} 0 0 1 ${1 + r} 1 Z`;
        const path = border.firstElementChild;
        if (path.getAttribute('d') !== d) { border.setAttribute('viewBox', `0 0 ${w} ${h}`); path.setAttribute('d', d); }
      }
    }
    _fitRows() {
      if (!this.isConnected || !this._values) return;
      for (const button of Object.values(this._values)) {
        const row = button.parentElement;
        if (!row.clientWidth) continue;
        row.style.removeProperty('font-size');
        const label = row.querySelector('.label');
        const range = document.createRange();
        const width = (element) => { range.selectNodeContents(element); return range.getBoundingClientRect().width; };
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        const available = row.clientWidth - gap - 1;
        const needed = () => width(label) + width(button);
        const naturalWidth = needed();
        if (naturalWidth <= available) continue;
        let size = Math.floor(parseFloat(getComputedStyle(row).fontSize) * available / naturalWidth * 10) / 10;
        row.style.fontSize = `${size}px`;
        while (needed() > available && size > 1) {
          size = Math.max(1, Math.round((size - .1) * 10) / 10);
          row.style.fontSize = `${size}px`;
        }
      }
    }
    _drawPaths() {
      if (!this._diagram || !this.isConnected) return;
      this._fitRows(); this._layoutConsumers(); this._drawBorders();
      const base = this._diagram.getBoundingClientRect(); if (!base.width || !base.height) return;
      const rect = (key) => { const r = (key.startsWith('consumer:') ? this._consumerNodes.get(key.slice(9)) : this._nodes[key]).getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height, right: r.right - base.left, bottom: r.bottom - base.top }; };
      const g = rect('grid'), a = rect('auxiliary_1'), b = rect('auxiliary_2'), m = rect('main'), h = rect('home');
      const midY = g.y + g.h / 2, rightCorridor = (m.right + b.x) / 2;
      const homeLane = Math.max(h.bottom + 10, m.y + 12), chargingLane = Math.max(h.bottom + 20, m.y + 6);
      const routes = {
        grid_auxiliary_1: `M ${a.x + a.w * .25} ${g.bottom} V ${a.y}`,
        grid_auxiliary_2: `M ${g.right} ${g.y + g.h * .70} H ${rightCorridor} V ${chargingLane} H ${b.x + b.w * .90} V ${b.y}`,
        grid_main: `M ${g.right} ${g.y + g.h * .80} H ${(g.right + m.x) / 2} V ${m.y + m.h * .55} H ${m.x}`,
        grid_home: `M ${g.right} ${midY} H ${h.x}`,
        auxiliary_1_main: `M ${a.right} ${a.y + a.h / 2} H ${m.x}`,
        auxiliary_2_main: `M ${b.x} ${b.y + b.h / 2} H ${m.right}`,
        main_home: `M ${m.right} ${homeLane} H ${h.x + h.w / 2} V ${h.bottom}`
      };
      for (const [row, lower] of [['lower', true], ['upper', false]]) {
        const members = [...this._consumerNodes].filter(([, node]) => (Number(node.dataset.slot) < 3) === lower);
        if (!members.length) continue;
        const bounds = members.map(([id]) => rect(`consumer:${id}`)), lane = bounds[0].bottom + 10;
        const port = lower ? h.x + h.w * .70 : base.width - 4;
        const leftmost = Math.min(...bounds.map(c => c.x + c.w / 2));
        routes[`home_row_${row}`] = `M ${port} ${h.y} V ${lane} H ${leftmost}`;
        members.forEach(([id], index) => { const c = bounds[index]; routes[`home_consumer_${id}`] = `M ${c.x + c.w / 2} ${lane} V ${c.bottom}`; });
      }
      const geometry = JSON.stringify(routes); if (geometry === this._geometry && this._svg.childElementCount) return;
      const oldFlows = this._flows;
      for (const [name, flow] of Object.entries(oldFlows)) if (!(name in routes)) flow._animation?.cancel();
      this._geometry = geometry; this._svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`); this._svg.replaceChildren(); this._flows = {};
      const defs = document.createElementNS(NS, 'defs'), mask = document.createElementNS(NS, 'mask');
      mask.id = this._maskId; mask.setAttribute('maskUnits', 'userSpaceOnUse'); mask.style.maskType = 'luminance';
      for (const [attribute, value] of Object.entries({ x: 0, y: 0, width: base.width, height: base.height })) mask.setAttribute(attribute, String(value));
      const area = document.createElementNS(NS, 'rect'); area.setAttribute('width', String(base.width)); area.setAttribute('height', String(base.height)); area.setAttribute('fill', 'white'); mask.append(area);
      for (const [key, node] of [...Object.entries(this._nodes), ...[...this._consumerNodes].map(([id, node]) => [`consumer:${id}`, node])]) {
        const bounds = rect(key), cutout = document.createElementNS(NS, 'rect');
        for (const [attribute, value] of Object.entries({ x: bounds.x, y: bounds.y, width: bounds.w, height: bounds.h, rx: parseFloat(getComputedStyle(node).borderTopLeftRadius) })) cutout.setAttribute(attribute, String(value));
        cutout.setAttribute('fill', 'black'); mask.append(cutout);
      }
      defs.append(mask); const layer = document.createElementNS(NS, 'g'); layer.setAttribute('mask', `url(#${this._maskId})`); this._svg.append(defs, layer);
      for (const [name, route] of Object.entries(routes)) {
        const group = oldFlows[name] || document.createElementNS(NS, 'g'); group.classList.add('flow'); group.dataset.flow = name;
        const color = name.startsWith('grid') ? 'grid' : name === 'main_home' ? 'main' : name.startsWith('auxiliary_1') ? 'auxiliary_1' : 'auxiliary_2';
        group.style.setProperty('--color', name.startsWith('home_') ? 'var(--flow-home)' : `var(--flow-${color})`);
        const path = group.querySelector('.flow-track') || document.createElementNS(NS, 'path'); path.classList.add('flow-track'); path.setAttribute('d', route); group.append(path);
        const dashes = group.querySelector('.flow-dashes') || document.createElementNS(NS, 'path'); dashes.classList.add('flow-dashes'); dashes.setAttribute('d', route); group.append(dashes);
        if (!group._animation) { group._animation = dashes.animate([{ strokeDashoffset: '0px' }, { strokeDashoffset: '-28px' }], { duration: 1000, iterations: Infinity });
        group._animation.pause(); }
        group.classList.toggle('active', !!this._data?.flows[name]); this._flows[name] = group; layer.append(group);
      }
      this._syncFlows();
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
    uk: { title: 'Заголовок', language: 'Мова', name: 'Назва', power: 'Потужність', input_power: 'Загальна вхідна потужність', output_power: 'Загальна вихідна потужність', soc: 'Заряд батареї (%)', ac_input_power: 'Потужність входу від міської мережі (AC)', solar_input_power: 'Потужність входу XT60(1) (DC)', solar_input_power_2: 'Потужність входу XT60(2) (DC)', grid_charge_power: 'Потужність заряджання від мережі (необов’язково)', transfer_power: 'Потужність передачі на головну EcoFlow (необов’язково)', home_feed_power: 'Потужність виходу на дім (необов’язково)', available_entity: 'Наявність міської мережі', available_state: 'Стан «мережа є»', source_entity: 'Сутність джерела живлення дому', grid_state: 'Стан «дім від міської мережі»', main_state: 'Стан «дім від головної EcoFlow»', grid_color: 'Колір мережі: рамка та потоки', auxiliary_1_color: 'Колір EcoFlow №2: рамка та потік', auxiliary_2_color: 'Колір EcoFlow №3: рамка та потік', solar_color: 'Колір передачі між станціями', main_color: 'Колір головної EcoFlow: рамка та потік', threshold: 'Поріг активного потоку (Вт)', duration: 'Базовий час руху (с)' },
    en: { title: 'Title', language: 'Language', name: 'Name', power: 'Power', input_power: 'Total input power', output_power: 'Total output power', soc: 'Battery charge (%)', ac_input_power: 'City grid input power (AC)', solar_input_power: 'XT60(1) input power (DC)', solar_input_power_2: 'XT60(2) input power (DC)', grid_charge_power: 'Grid charging power (optional)', transfer_power: 'Transfer power to main EcoFlow (optional)', home_feed_power: 'Output power to home (optional)', available_entity: 'Grid availability', available_state: 'Grid available state', source_entity: 'Home power source entity', grid_state: 'State: home powered by grid', main_state: 'State: home powered by main EcoFlow', grid_color: 'Grid border and flow color', auxiliary_1_color: 'EcoFlow #2 border and flow color', auxiliary_2_color: 'EcoFlow #3 border and flow color', solar_color: 'Station transfer color', main_color: 'Main EcoFlow border and flow color', threshold: 'Active flow threshold (W)', duration: 'Base movement time (s)' }
  };
  Object.assign(FIELD_LABELS.uk, { voltage: 'Напруга дому (необов’язково)', available_entity: 'Наявність міської мережі (необов’язково)' });
  Object.assign(FIELD_LABELS.en, { voltage: 'Home voltage (optional)', available_entity: 'Grid availability (optional)' });
  const entityField = (name, power = true) => ({ name, selector: { entity: power ? { domain: 'sensor' } : {} } });
  const textField = (name) => ({ name, selector: { text: {} } });
  const rgbToHsl = hex => {
    const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, light = (max + min) / 2;
    const hue = !delta ? 0 : max === r ? ((g - b) / delta + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / delta + 2) * 60 : ((r - g) / delta + 4) * 60;
    return [hue, delta ? delta / (1 - Math.abs(2 * light - 1)) * 100 : 0, light * 100];
  };
  const hslToHex = ([h, s, l]) => {
    s /= 100; l /= 100; const a = s * Math.min(l, 1 - l);
    return '#' + [0, 8, 4].map(n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }).join('');
  };
  class SurisEcoFlowFlowEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); this._forms = []; this._colorControls = new Map(); }
    setConfig(config) {
      const serialized = JSON.stringify(config);
      if (serialized === JSON.stringify(this._config) || serialized === this._lastPublished) return;
      this._config = draftConfig(config);
      this._refreshForms(); this._validateDraft();
    }
    set hass(hass) { this._hass = hass; for (const form of this._forms) form.hass = hass; }
    get hass() { return this._hass; }
    connectedCallback() { if (this._config && !this._forms.length) this._build(); }
    _formData(section) { if (section.startsWith('consumer:')) return this._config.consumers.find(consumer => consumer.id === section.slice(9)); return section ? this._config[section] : { title: this._config.title, language: this._config.language }; }
    _refreshForms() {
      const language = this._config.language === 'en' ? 'en' : 'uk';
      if (!this._forms.length || language !== this._schemaLanguage || JSON.stringify(this._config.consumers.map(consumer => consumer.id)) !== this._consumerStructure) { this._build(); return; }
      for (const form of this._forms) {
        const section = form.dataset.section, data = this._formData(section);
        if (JSON.stringify(form.data) !== JSON.stringify(data)) form.data = data;
        if (section === 'auxiliary_1' || section === 'auxiliary_2' || section.startsWith('consumer:')) { const name = data.name || DEFAULTS[section]?.name || t(this._config).consumer; form.parentNode.querySelector('summary').textContent = name; if (section.startsWith('consumer:')) form.parentNode.querySelector('.consumer-remove').setAttribute('aria-label', `${t(this._config).removeConsumer}: ${name}`); }
      }
      this._refreshColors();
    }
    _validateDraft() {
      let valid = true;
      try { merge(this._config); } catch { valid = false; }
      if (this._validation) {
        this._validation.hidden = valid;
        this._validation.textContent = valid ? '' : this._config.language === 'en'
          ? 'Complete the color or number before it is applied. Colors: red, green, #ff0000, rgb(255, 0, 0).'
          : 'Допиши колір або числове значення, щоб застосувати зміну. Кольори: red, green, #ff0000, rgb(255, 0, 0).';
      }
      return valid;
    }
    _publishConfig() {
      if (!this._validateDraft()) return;
      const config = structuredClone(this._config), serialized = JSON.stringify(config);
      if (serialized === this._lastPublished) return;
      this._lastPublished = serialized;
      this.dispatchEvent(new CustomEvent('config-changed', { bubbles: true, composed: true, detail: { config } }));
    }
    _colorPicker(section, key, label) {
      const en = this._config.language === 'en', details = document.createElement('details'); details.className = 'color-picker';
      details.dataset.colorSection = section; details.dataset.colorKey = key; details.open = this._openColors?.has(`${section}.${key}`) || false;
      const summary = document.createElement('summary'), chip = document.createElement('span'), title = document.createElement('span'); chip.className = 'color-chip'; title.textContent = label; summary.append(chip, title); details.append(summary);
      const mixer = document.createElement('div'); mixer.className = 'color-mixer';
      const top = document.createElement('div'), native = document.createElement('input'), code = document.createElement('output'); top.className = 'color-top'; native.type = 'color'; native.className = 'color-native'; native.setAttribute('aria-label', en ? 'Choose custom color' : 'Обрати власний колір'); code.className = 'color-code'; top.append(native, code); mixer.append(top);
      const control = { section, key, chip, native, code, sliders: {}, outputs: {}, hsl: [0, 100, 50], last: null }; this._colorControls.set(`${section}.${key}`, control);
      const choose = (color, hsl) => {
        control.last = color || null; if (color) control.hsl = hsl || rgbToHsl(color);
        if (section.startsWith('consumer:')) this._config = { ...this._config, consumers: this._config.consumers.map(item => item.id === section.slice(9) ? { ...item, [key]: color } : item) };
        else this._config = { ...this._config, [section]: { ...this._config[section], [key]: color } };
        this._refreshForms(); this._publishConfig();
      };
      native.addEventListener('input', () => choose(native.value));
      const presets = document.createElement('div'); presets.className = 'color-presets';
      for (const color of ['#ff3b30', '#ff8800', '#ffcc00', '#6bcf37', '#008000', '#20b8a6', '#29a7ff', '#254bdb', '#8a4fe8', '#e84393', '#8d3449', '#8a8f98']) {
        const button = document.createElement('button'); button.type = 'button'; button.style.setProperty('--swatch', color); button.dataset.color = color; button.setAttribute('aria-label', `${en ? 'Color' : 'Колір'} ${color}`); button.addEventListener('click', () => choose(color)); presets.append(button);
      }
      control.presets = presets; mixer.append(presets);
      const labels = en ? ['Hue', 'Saturation', 'Brightness'] : ['Відтінок', 'Насиченість', 'Яскравість'];
      ['hue', 'saturation', 'brightness'].forEach((name, index) => {
        const label = document.createElement('label'), caption = document.createElement('span'), output = document.createElement('output'), input = document.createElement('input'); label.className = 'color-slider'; caption.textContent = labels[index]; input.type = 'range'; input.min = '0'; input.max = index === 0 ? '360' : '100'; input.step = '1'; input.dataset.component = name; input.setAttribute('aria-label', labels[index]);
        input.addEventListener('input', () => { const hsl = [...control.hsl]; hsl[index] = Number(input.value); choose(hslToHex(hsl), hsl); }); label.append(caption, output, input); mixer.append(label); control.sliders[name] = input; control.outputs[name] = output;
      });
      const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'color-reset'; reset.textContent = en ? 'Default color' : 'Типовий колір'; reset.addEventListener('click', () => choose('')); mixer.append(reset); details.append(mixer); return details;
    }
    _refreshColors() {
      for (const control of this._colorControls.values()) {
        const raw = String(this._formData(control.section)?.[control.key] || '').trim();
        const color = raw || (control.section.startsWith('consumer:') ? '#4b9fff' : this._config.appearance[control.key.startsWith('auxiliary_') ? 'solar_color' : control.key] || DEFAULTS.appearance[control.key]);
        if (!globalThis.CSS?.supports('color', color)) continue;
        if (control.resolvedColor !== color) {
        const probe = document.createElement('span'); probe.style.color = color; this.shadowRoot.append(probe); const computed = getComputedStyle(probe).color; probe.remove();
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1; const ctx = canvas.getContext('2d'); ctx.fillStyle = computed; ctx.fillRect(0, 0, 1, 1); const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); const hex = '#' + rgb.map(value => value.toString(16).padStart(2, '0')).join('');
        control.hex = hex; control.resolvedColor = color;
        }
        const hex = control.hex;
        if (control.last !== raw) { control.hsl = rgbToHsl(hex); control.last = raw; }
        control.chip.style.background = color; control.native.value = hex; control.code.textContent = hex;
        const [h, sat, light] = control.hsl;
        for (const [index, name] of ['hue', 'saturation', 'brightness'].entries()) { control.sliders[name].value = String(control.hsl[index]); control.outputs[name].textContent = `${Math.round(control.hsl[index])}${index === 0 ? '°' : '%'}`; }
        control.sliders.hue.style.background = 'linear-gradient(to right,red,#ff0,#0f0,#0ff,#00f,#f0f,red)';
        control.sliders.saturation.style.background = `linear-gradient(to right,hsl(${h} 0% ${light}%),hsl(${h} 100% ${light}%))`;
        control.sliders.brightness.style.background = `linear-gradient(to right,#000,hsl(${h} ${sat}% 50%),#fff)`;
        for (const button of control.presets.children) button.setAttribute('aria-pressed', String(button.dataset.color === hex));
      }
    }
    _build() {
      if (!this._config) return;
      const openSections = new Set([...this.shadowRoot.querySelectorAll('details[open]')].map(details => details.dataset.section));
      this._openColors = new Set([...this.shadowRoot.querySelectorAll('.color-picker[open]')].map(details => `${details.dataset.colorSection}.${details.dataset.colorKey}`));
      const c = this._config, text = t(c); this._forms = []; this._validation = null; this._colorControls = new Map();
      this._consumerStructure = JSON.stringify(c.consumers.map(consumer => consumer.id));
      this._schemaLanguage = c.language === 'en' ? 'en' : 'uk';
      this.shadowRoot.innerHTML = '<style>:host{display:block}details{border:1px solid var(--divider-color,#777);border-radius:10px;padding:12px;margin:12px 0}summary{cursor:pointer;font-weight:600;padding:4px 0}ha-form{display:block;margin-top:12px}p{font-size:13px;color:var(--secondary-text-color);line-height:1.5}.error{color:var(--error-color,#d44)}button{padding:8px 12px;border:1px solid var(--divider-color,#777);border-radius:8px;background:var(--secondary-background-color,#222);color:var(--primary-text-color,#eee);cursor:pointer}button:disabled{opacity:.5;cursor:default}.consumer-remove{margin-top:12px}.color-picker{padding:8px;margin:10px 0}.color-picker summary{display:flex;align-items:center;gap:8px;font-size:14px}.color-chip{width:24px;height:24px;border:1px solid var(--divider-color,#777);border-radius:6px;flex:none}.color-mixer{display:grid;gap:10px;margin-top:12px}.color-top{display:flex;gap:12px;align-items:center}.color-native{width:50px;height:42px;padding:2px;border:1px solid var(--divider-color,#777);border-radius:8px;background:transparent;cursor:pointer}.color-code{font:14px monospace}.color-presets{display:flex;flex-wrap:wrap;gap:7px}.color-presets button{width:36px;height:36px;min-width:36px;padding:0;border:2px solid var(--divider-color,#777);border-radius:7px;background:var(--swatch)}.color-presets button[aria-pressed="true"]{outline:2px solid var(--primary-text-color,#222);outline-offset:2px}.color-slider{display:grid;grid-template-columns:1fr auto;gap:6px;font-size:13px}.color-slider input{grid-column:1 / -1;width:100%;height:30px;margin:0;border-radius:8px;appearance:none;border:1px solid var(--divider-color,#777);cursor:pointer}.color-slider input::-webkit-slider-thumb{appearance:none;width:18px;height:24px;border:2px solid #fff;box-shadow:0 0 2px #222;border-radius:5px;background:transparent}.color-slider input::-moz-range-thumb{width:15px;height:22px;border:2px solid #fff;border-radius:5px;background:transparent}.color-reset{justify-self:start}</style>';
      if (!customElements.get('ha-form')) {
        const warning = document.createElement('p'); warning.className = 'error'; warning.textContent = text.editorError; this.shadowRoot.append(warning);
        ensureForm().then(() => { if (this.isConnected && !this._forms.length && customElements.get('ha-form')) this._build(); });
        return;
      }
      const stationSchema = [textField('name'), entityField('soc'), entityField('input_power'), entityField('output_power')];
      const sections = [
        ['', text.settings, [textField('title'), { name: 'language', selector: { select: { options: [{ value: 'uk', label: 'Українська' }, { value: 'en', label: 'English' }], mode: 'dropdown' } } }], ''],
        ['grid', text.grid, [textField('name'), entityField('power'), entityField('available_entity', false), textField('available_state')], text.gridHint],
        ['auxiliary_1', c.auxiliary_1.name || DEFAULTS.auxiliary_1.name, [...stationSchema, entityField('grid_charge_power'), entityField('transfer_power')], text.auxHint],
        ['auxiliary_2', c.auxiliary_2.name || DEFAULTS.auxiliary_2.name, [...stationSchema, entityField('grid_charge_power'), entityField('transfer_power')], text.auxHint],
        ['main', text.main, [...stationSchema, entityField('ac_input_power'), entityField('solar_input_power'), entityField('solar_input_power_2'), entityField('home_feed_power')], text.mainHint],
        ['home', text.home, [textField('name'), entityField('power'), { name: 'voltage', selector: { entity: { domain: 'sensor', device_class: 'voltage' } } }], `${text.sourceHint} ${text.homeDerived}`],
        ['appearance', c.language === 'en' ? 'Flow appearance' : 'Вигляд потоків', [textField('grid_color'), textField('auxiliary_1_color'), textField('auxiliary_2_color'), textField('main_color'), { name: 'threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: text.watts } } }, { name: 'duration', selector: { number: { min: .5, max: 20, step: .5, mode: 'box', unit_of_measurement: 's' } } }], `${text.flowHint} ${c.language === 'en' ? 'Open a color below to choose a swatch or mix hue, saturation and brightness. Each source color applies to its border and outgoing flows. Home uses its active source color. Colors: red, green, #ff0000, rgb(255, 0, 0), hsl(120, 100%, 25%). An empty field restores the default color.' : 'Відкрий колір нижче, щоб обрати зразок або змішати відтінок, насиченість і яскравість. Колір джерела застосовується до його рамки та вихідних потоків. Рамка дому має колір активного джерела. Кольори: red, green, #ff0000, rgb(255, 0, 0), hsl(120, 100%, 25%). Порожнє поле повертає типовий колір.'}`]
      ];
      for (const consumer of c.consumers) sections.push([`consumer:${consumer.id}`, consumer.name || text.consumer, [textField('name'), entityField('power'), { name: 'icon', selector: { icon: {} } }, textField('color')], '']);
      for (const [section, label, schema, hint] of sections) {
        const details = document.createElement('details'); details.dataset.section = section; details.open = !section || openSections.has(section);
        const summary = document.createElement('summary'); summary.textContent = label; details.append(summary);
        if (hint) { const p = document.createElement('p'); p.textContent = hint; details.append(p); }
        const form = document.createElement('ha-form'); form.hass = this._hass; form.schema = schema;
        form.dataset.section = section; form.data = this._formData(section);
        form.computeLabel = (field) => section.startsWith('consumer:') ? ({ name: (FIELD_LABELS[c.language] || FIELD_LABELS.uk).name, power: text.consumerPower, icon: text.consumerIcon, color: text.consumerColor }[field.name] || field.name) : section === 'home' && field.name === 'power' ? t(this._config).homePowerLabel : (FIELD_LABELS[this._config.language] || FIELD_LABELS.uk)[field.name] || field.name;
        form.addEventListener('value-changed', (event) => {
          event.stopPropagation();
          const value = event.detail?.value;
          if (!value || typeof value !== 'object' || Array.isArray(value)) return;
          if (section.startsWith('consumer:')) this._config = { ...this._config, consumers: this._config.consumers.map(consumer => consumer.id === section.slice(9) ? { ...consumer, ...value, id: consumer.id } : consumer) };
          else this._config = section ? { ...this._config, [section]: { ...this._config[section], ...value } } : { ...this._config, ...value };
          this._refreshForms(); this._publishConfig();
        });
        this._forms.push(form); details.append(form);
        if (section === 'appearance') for (const key of ['grid_color', 'auxiliary_1_color', 'auxiliary_2_color', 'main_color']) details.append(this._colorPicker(section, key, (FIELD_LABELS[c.language] || FIELD_LABELS.uk)[key]));
        if (section.startsWith('consumer:')) details.append(this._colorPicker(section, 'color', text.consumerColor));
        if (section.startsWith('consumer:')) {
          const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'consumer-remove'; remove.textContent = text.removeConsumer;
          remove.setAttribute('aria-label', `${text.removeConsumer}: ${label}`);
          remove.addEventListener('click', () => { this._config = { ...this._config, consumers: this._config.consumers.filter(consumer => consumer.id !== section.slice(9)) }; this._build(); this._publishConfig(); }); details.append(remove);
        }
        this.shadowRoot.append(details);
      }
      const consumerHeading = document.createElement('h3'); consumerHeading.textContent = `${text.consumers} (${c.consumers.length}/20)`;
      const consumerHint = document.createElement('p'); consumerHint.textContent = text.consumerHint;
      const add = document.createElement('button'); add.type = 'button'; add.dataset.action = 'add-consumer'; add.textContent = text.addConsumer; add.disabled = c.consumers.length >= 20;
      add.addEventListener('click', () => {
        if (this._config.consumers.length >= 20) return;
        let number = 1; while (this._config.consumers.some(consumer => consumer.id === `consumer_${number}`)) number++;
        const consumer = { id: `consumer_${number}`, name: `${text.consumer} ${number}`, power: '', icon: 'mdi:power-plug', color: '#4b9fff' };
        this._config = { ...this._config, consumers: [...this._config.consumers, consumer] }; this._build();
        const details = [...this.shadowRoot.querySelectorAll('details')].find(item => item.dataset.section === `consumer:${consumer.id}`); if (details) details.open = true;
        this._publishConfig();
      });
      const firstConsumer = [...this.shadowRoot.querySelectorAll('details')].find(details => details.dataset.section?.startsWith('consumer:'));
      for (const element of [consumerHeading, consumerHint, add]) this.shadowRoot.insertBefore(element, firstConsumer || null);
      this._validation = document.createElement('p'); this._validation.setAttribute('role', 'status'); this._validation.hidden = true; this.shadowRoot.append(this._validation);
      this._refreshColors(); this._validateDraft();
    }
  }
  if (!customElements.get(TAG)) customElements.define(TAG, SurisEcoFlowFlowCard);
  if (!customElements.get(`${TAG}-editor`)) customElements.define(`${TAG}-editor`, SurisEcoFlowFlowEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === TAG)) window.customCards.push({ type: TAG, name: 'Suris EcoFlow Flow Card', description: 'Three EcoFlow stations and up to 20 home consumers. Visual editor.', preview: true });
  console.info(`%c SURIS ECOFLOW FLOW CARD %c ${VERSION}`, 'background:#27d9d5;color:#111;padding:4px', 'padding:4px');
})();
