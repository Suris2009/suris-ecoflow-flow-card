# Suris EcoFlow Flow Card 2.1.0

## English

**Suris EcoFlow Flow Card 2.1.0**

A Home Assistant energy flow card that brings the city grid, three EcoFlow stations, Home and individual consumers into one diagram.

**Flows follow changes in consumption.** Each line responds to its own power readings: higher consumption makes movement faster; lower consumption slows it down. Direction shows energy moving from its source to its consumer. Readings, active connections and animation speed update with Home Assistant sensors. Equal power produces equal visual speed regardless of route length.

- **Two views in one card.** Switch between Classic and compact Side flow with the View button. The selection is remembered for this card in the current browser.
- **Up to six consumers at once.** Configure up to 20 devices. If more than six are active, the highest-power devices appear. Retained devices keep their positions, and inactive consumers are hidden.
- **Complete routes to each device.** In Side flow, every consumer has a separate, complete line from Home in its own color. In Classic, dots and arrows follow the shared feeder and turn into the appropriate consumer branch.
- **Custom colors.** Set separate colors for the city grid, each station and each device. Choose presets, use a palette, mix hue, saturation and lightness, or restore defaults. Home’s border automatically takes the color of its power source.
- **Five animations.** Moving dashes, dots, arrows, pulsing light strips and one moving dot. Dot size is adjustable from 2 to 10 px.
- **Adjustable speed and activity threshold.** Set the overall movement speed in the editor; each line also responds to its own power. Live readings adjust speed without restarting the animation. Inactive connections stay hidden.
- **All key readings.** Battery charge, input and output for three stations; a dedicated AC input and two XT60(1)/XT60(2) inputs for the main EcoFlow. Home shows power and optional voltage. Values automatically use W or kW.
- **Automatic Home source detection.** Power readings determine the source. A separate Home power sensor is optional: the card can use main EcoFlow output or calculate Home demand from grid power minus station charging.
- **Grid outage warning.** An optional availability sensor triggers a pulsing No grid message inside the grid block. Supplying sources have clockwise moving dashed borders; Home retains a solid border.
- **Names, icons and details.** Side flow keeps consumer names on one line, ending long names with two dots; the full name remains in the tooltip. Icons are centered between name and power. Clicking a reading with a configured entity opens its details.
- **Mobile layouts and themes.** Light and dark themes, a compact Side flow view, and automatic Classic height reduction when a consumer row is unused. System reduced-motion preferences are respected.

Configure the card in the visual editor without mandatory YAML. The interface supports Ukrainian and English. The card runs locally using existing Home Assistant entities, without runtime dependencies or a CDN. Install and update through HACS or a single JS file. Existing card settings are retained when upgrading.

### Screenshots

Screenshots of the actual card with demonstration readings. Station names, entities and colors are configurable.

| Side flow: grid supply and station charging | Classic with the same readings |
| --- | --- |
| <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-sideflow-grid-en.png" width="390" alt="Side flow: grid supply and station charging"> | <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-classic-grid-en.png" width="390" alt="Classic with the same readings"> |

| EcoFlow supply and two XT60 inputs | Grid outage warning in a light theme |
| --- | --- |
| <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-sideflow-main-en.png" width="390" alt="EcoFlow supply and two XT60 inputs"> | <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-sideflow-outage-en.png" width="390" alt="Grid outage warning in a light theme"> |

## Українська

**Suris EcoFlow Flow Card 2.1.0**

Картка енергопотоків для Home Assistant, яка показує міську мережу, три станції EcoFlow, дім та індивідуальні споживачі в одній схемі.

**Потоки повторюють зміни споживання.** Кожна лінія реагує на власні показання потужності: більше споживання — швидший рух, менше — повільніший. Напрямок показує передачу енергії від джерела до споживача. Показники, активність ліній і швидкість оновлюються разом із датчиками Home Assistant. Однакова потужність дає однакову швидкість незалежно від довжини маршруту.

- **Два вигляди в одній картці.** Класичне розташування та компактний «Боковий потік». Перемикання кнопкою «Вигляд»; вибір запам’ятовується для цієї картки у поточному браузері.
- **До шести споживачів одночасно.** Можна налаштувати до 20 приладів. Якщо активних більше шести, показуються найпотужніші. Решта зберігають свої місця, а неактивні прилади приховуються.
- **Окремі маршрути до приладів.** У «Боковому потоці» кожен споживач має повну власну лінію від дому в кольорі приладу. У класичному вигляді точки та стрілки проходять спільну лінію й повертають до свого споживача.
- **Настроювані кольори.** Окремі кольори міської мережі, кожної станції та кожного приладу. Є готові зразки, палітра, змішування відтінку, насиченості й яскравості та повернення типового кольору. Рамка дому автоматично має колір його джерела живлення.
- **П’ять анімацій.** Рухомі штрихи, точки, стрілки, пульсуючі світлові смуги та одна рухома точка. Розмір точок регулюється від 2 до 10 px.
- **Регулювання швидкості та порога активності.** Загальну швидкість руху можна змінювати в редакторі, а кожна лінія додатково реагує на свою потужність. Оновлення показників змінює швидкість без перезапуску анімації. Неактивні лінії приховані.
- **Усі основні показники.** Заряд, вхід і вихід трьох станцій; окремий AC-вхід головної EcoFlow та два входи XT60(1)/XT60(2). Для дому — потужність і необов’язковий датчик напруги. Значення автоматично відображаються у W або kW.
- **Автоматичне визначення живлення дому.** Джерело визначається за показаннями потужності. Окремий датчик потужності дому необов’язковий: картка може використовувати вихід головної EcoFlow або розрахунок від мережі з відніманням заряджання станцій.
- **Попередження про відсутність мережі.** За налаштованим датчиком у блоці мережі блимає напис «Мережі немає». Джерела, що віддають енергію, мають рухомі пунктирні рамки за годинниковою стрілкою; рамка дому залишається суцільною.
- **Назви, іконки та докладні дані.** У «Боковому потоці» назви приладів показані одним рядком, довгі скорочуються двома крапками; повна назва є в підказці. Іконки вирівняні між назвою та потужністю. Натискання показника з налаштованою сутністю відкриває її докладну інформацію.
- **Мобільний інтерфейс і теми.** Світле й темне оформлення, компактний боковий вигляд та автоматичне зменшення висоти класичного вигляду, коли ряд споживачів не потрібен. Підтримується системне зменшення руху.

Налаштування — через візуальний редактор, без обов’язкового YAML. Інтерфейс українською та англійською. Картка працює локально з наявними сутностями Home Assistant; для неї не потрібні зовнішні бібліотеки чи CDN. Встановлення та оновлення — через HACS або одним JS-файлом. Наявні налаштування картки зберігаються після оновлення.

### Скриншоти

Скриншоти реальної картки з демонстраційними показниками. Назви станцій, датчики та кольори налаштовуються.

| Боковий потік: мережа та заряджання станцій | Класичний вигляд із тими самими показниками |
| --- | --- |
| <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-sideflow-grid-uk.png" width="390" alt="Боковий потік: мережа та заряджання станцій"> | <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-classic-grid-uk.png" width="390" alt="Класичний вигляд із тими самими показниками"> |

| Живлення від EcoFlow та два входи XT60 | Відсутність міської мережі, світла тема |
| --- | --- |
| <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-sideflow-main-uk.png" width="390" alt="Живлення від EcoFlow та два входи XT60"> | <img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.0/preview-sideflow-outage-uk.png" width="390" alt="Відсутність міської мережі, світла тема"> |
