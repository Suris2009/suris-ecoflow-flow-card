# 2.1.1 — Home border and optional names / Рамка дому та необов’язкові назви

## English

- Increase Home’s solid border slightly, from 3 px to 4 px, in both layouts.
- Add separate switches for custom grid and Home names above their frames in Side flow. The names do not increase card height or replace the icons.
- Keep existing view preferences, power calculations, consumer sizes, flow colors and animations.

In **City grid** and **Home**, enter text in **Name** and enable **Show name above the block in Side flow**. Each name is controlled independently and appears above its frame. Long names are truncated, with the full text in a tooltip. Names are hidden by default and do not increase the card height.

<img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.1/preview-sideflow-names-en.png" width="390" alt="Side flow with grid and Home names above the frames">

## Українська

- Суцільна рамка дому трохи товстіша: 4 px замість 3 px в обох виглядах.
- Додано окремі перемикачі довільних назв над рамками мережі й дому в боковому вигляді. Назви не збільшують висоту картки та не замінюють іконки.
- Збережено вибір вигляду, розрахунки потужності, розміри споживачів, кольори й анімації потоків.

У блоках **Міська мережа** та **Дім** введи текст у полі **Назва** й увімкни **Показувати назву над блоком у боковому вигляді**. Назви вмикаються окремо та показуються над відповідними рамками. Довгі назви скорочуються, а повний текст доступний у підказці. За замовчуванням назви приховані; висота картки не збільшується.

<img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.1/preview-sideflow-names-uk.png" width="390" alt="Боковий потік із назвами над рамками мережі й дому">

<details>
<summary>Earlier releases / Попередні випуски</summary>

# Changelog

## 2.1.0 — Stable / Стабільний випуск

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


<details>
<summary>Earlier releases / Попередні випуски</summary>

## 2.1.0-beta.5 — Icon alignment and fewer dots / Центрування іконок і менше точок

- Center the actual Home Assistant icon drawing between each consumer’s name and power. Remove the inline baseline offset from the nested icon component; center the fallback artwork as well.
- Reduce moving-dot density by 30%: use 40 px spacing instead of 28 px on independent routes, and 70% of the previous rounded particle count on shared consumer journeys (at least one particle).
- Keep flow movement speed, the single-dot mode, arrows, dashes and pulse behavior. Preserve consumer block sizes, name fonts, one-line names and the power model.

Іконки споживачів вирівняно між назвою та потужністю. Рухомих точок на 30% менше; швидкість потоку та режим однієї точки збережено. Шрифт назв і розміри блоків не змінені.

## 2.1.0-beta.4 — Consumer icons / Іконки споживачів

- Show each consumer’s configured icon between its name and power in Side flow, using the existing icon picker and fallback artwork.
- Keep the wider rectangles, their heights and the existing name font size. Names remain on one line with two dots when truncated.
- Fit the icon, title and value inside every block at mobile and desktop widths, without overlaps. Keep power logic, independent routes, hidden inactive lines and Classic unchanged.

У блоках споживачів показано налаштовані іконки між назвою та потужністю. Розмір шрифту назв і висоту блоків збережено; назви без перенесень, із двома крапками наприкінці, якщо не вміщуються.

## 2.1.0-beta.3 — Wider consumer rectangles / Ширші блоки споживачів

- Widen the Side flow consumer blocks into identical rectangles while preserving their heights and vertical positions.
- Keep consumer names on one line. Names that do not fit end with exactly two dots (`..`); full names remain available in tooltips and accessible labels. Refit on resize and restore full text in Classic.
- Slightly reduce Home input and city-grid output font sizes, keeping them equal. Also reduce the Home voltage font slightly.
- Keep grid/Home icons, the outage message, independent routes, hidden inactive lines, view switching and the existing power logic.

Блоки споживачів ширші, з попередньою висотою. Назви без перенесень; якщо назва не вміщується, наприкінці дві крапки. Цифри потужності дому та міської мережі трохи менші й однакового розміру. Логіка картки збережена.

## 2.1.0-beta.2 — Side flow refinement / Уточнення бокового потоку

- Replace the visible City grid and Home headings in Side flow with their existing grid and house icons. Keep the square grid outage message.
- Use the same power font size for grid output and Home input.
- Give every visible consumer an identical square, align the column farther to the right and lengthen the separate Home-to-consumer routes while keeping the mobile layout compact.
- Preserve Classic, view switching, sensor calculations, hidden inactive lines and all five animations.

У «Боковому потоці» замість назв міської мережі та дому показано іконки. Розмір цифр їхньої потужності однаковий. Усі споживачі — однакові квадрати, а окремі лінії від дому довші. Логіка картки збережена.

## 2.1.0-beta.1 — Side flow / Боковий потік

- Add a compact Side flow layout: sources on the left, Home in the middle, and up to six active consumers on the right. Each consumer has a full independent colored route from Home, without shared feeders or crossed lines.
- Make the Side flow city-grid node square so the outage message fits inside it. Inactive lines remain hidden in both views.
- Keep Classic and Side flow in one card. Switch with the View / Вигляд button; the browser remembers the selection. The visual editor can set the starting layout and hide the switch.
- Keep all configured entities, station readings, consumer selection, home source detection, thresholds, flow speeds and five animation styles.
- Verify both layouts in Chromium, including 320–1150 px widths, zero to six consumers, outage restoration, animation routes, view switching, reduced motion and disconnected cards.

Бета додає «Боковий потік» із шістьма окремими лініями, квадратом міської мережі та перемиканням на класичне розташування кнопкою «Вигляд». Неактивні лінії приховані; логіка картки та налаштування датчиків збережені.

## 2.0.8 — Stable

Dots and arrows now follow the shared Home feeder into a consumer branch instead of animating that branch independently.

- Move each consumer particle continuously from Home, along the existing common line, through its junction and into the consumer block.
- In single-dot mode, use one dot per shared row. It visits that row’s consumers in turn; short branches no longer run separate repeating dots.
- Use the row’s total power for continuous movement through junctions and limit particle density to one feeder.
- Retain all five styles, the dot-size slider, existing track geometry, source detection, source outlines and dashboard settings.
- Verify positions and arrow direction before, at and after consumer junctions with one to six visible consumers, at 320–1150 px, plus the complete regression suite.

## 2.0.7 — Stable

Choose flow animations directly in the visual card editor.

- Five styles: current moving dashes, moving dots, moving arrows, pulsing light strips and one moving dot per active route.
- Shared dot-size slider from 2 to 10 px for both dot styles, with a 5 px default. Resize dots without restarting movement or rebuilding routes.
- Apply the selected style to station, home and consumer lines. Retain wattage-dependent speed, source-to-load direction and invisible inactive tracks.
- Keep the existing dashes as the default for saved configurations. Source outlines and power calculations retain their behavior.
- Use native browser animations without frame timers. Pause all particles when disconnected and show static active lines with reduced motion.
- Verify all five styles, exact route following and arrow orientation at 320–1150 px, editor persistence, live power and size changes, source switching and existing regression scenarios.

### Video demo

https://github.com/user-attachments/assets/e5172fc9-3b20-4533-9004-020b4e33d294

## 2.0.6 — Stable

Promote 2.0.6-beta.1 to stable, preserving its behavior and dashboard configuration.

- Hide the city grid Output row and retained wattage while the red Мережі немає / No grid warning is displayed.
- Restore the row automatically when the warning clears. Unknown, unavailable and unconfigured grid status retain the previous display behavior.
- Retain power calculations, flow detection, moving dashes and existing card settings. The beta passed the model and browser regression suites; the stable release changes version metadata and documentation only.

### Video demo

https://github.com/user-attachments/assets/e5172fc9-3b20-4533-9004-020b4e33d294

## 2.0.6-beta.1 — Pre-release

- Hide the city grid output power row while the red Мережі немає / No grid warning is displayed, so a retained sensor reading does not appear as live supply during an outage.
- Restore the reading automatically when the warning clears. Unknown, unavailable and unconfigured grid status retain the previous display behavior.
- Keep power calculations, flow detection, active dashes and existing card settings unchanged. Validate live outage and restoration in the browser.

## 2.0.5 — Stable

Promote 2.0.5-beta.2 to stable, preserving its behavior and dashboard configuration.

### Video demo

https://github.com/user-attachments/assets/e5172fc9-3b20-4533-9004-020b4e33d294

- Restore the grid-to-home flow when the main station is unavailable and grid power is above the flow threshold. Positive main output retains priority.
- Hide all inactive flow tracks. Active power flows retain their moving dashes; the grid availability sensor controls only the outage warning.
- Keep the neutral Home outline visible when power data is insufficient.
- Validate the flow model, responsive layouts, source switching, animation, editor and reduced motion.

## 2.0.5-beta.2 — Pre-release

- Hide inactive flow tracks, including routes to idle and unavailable stations. Only active energy flows remain visible.
- Retain the restored grid-to-home flow when the main station is unavailable, its moving dashes and the independent grid outage warning.
- Verify visibility while switching between grid supply, station charging and main-station supply, on mobile widths and with reduced motion.

## 2.0.5-beta.1 — Pre-release

- Restore the grid-to-home flow when the main station is unavailable and grid power is above the flow threshold. Positive main output keeps priority; the grid availability sensor still controls only its warning.
- Verify the reported 258 W grid, 221 V Home and offline main-station scenario, including visible moving dashes, charging subtraction and mobile widths.
- Keep the neutral Home outline and inactive tracks visible in themes with a white divider color; report insufficient power data instead of incorrectly prompting sensor selection.
- Publish as a beta for real Home Assistant testing. Withdraw 2.0.4 from stable releases.

## 2.0.4 — Withdrawn

Withdrawn from stable releases because the grid-to-home flow could disappear when the main station was unavailable. Use 2.0.5-beta.1 to test the correction.

- Remove grid availability from all flow decisions, including existing configurations and saved legacy source modes. The sensor only controls the red outage warning inside the city grid block.
- Determine Home supply from the main station home feed or total output; determine station charging and transfer flows from their own power readings.
- Remove the source-mode selector. No manual mode change is required after updating.
- Verify unchanged flows across every grid indicator state, with main and grid Home supply, plus editor migration and responsive warning text.

## 2.0.3 — Stable

- Make the grid availability sensor optional. Without it, detect the home source from the main station home feed or total output power.
- Add Home source detection in the visual editor: main output works independently of the grid status sensor; existing configurations retain their grid-sensor source mode.
- Show a red pulsing Мережі немає / No grid message inside the city grid block when its optional sensor reports an outage. Hide it when power returns, the sensor is not configured or its state is unknown; use steady text with reduced motion.
- Retain exclusive home supply flows, direct home power sensors, grid charging readings, all settings and existing route geometry.
- Verify source switching, indicator states, editor persistence, unsupported and unavailable output readings, mobile text fitting and reduced motion.

## 2.0.2 — Stable

- Keep the station #3 grid charging line at least 20 px below the Home block, including when a longer Home name adds a second heading line.
- Preserve orthogonal routes, the separate grid-to-home line, block sizes, voltage and existing configuration.
- Verify the clearance with zero, one and two consumer rows at 320–1150 px.

## 2.0.1 — Stable

- Route grid charging of station #3 below the grid-to-home line, without crossing it. All lines remain orthogonal.
- Give Home a slightly thicker, stationary 3 px outline while preserving the inner width for single-line labels and readings.
- Add an optional Home voltage sensor in the visual editor (`home.voltage`). Its reading appears below Input in V; unconfigured rows are hidden and unavailable values show `—`.
- Retain existing entities, colors, consumers and settings. Verify routing and text layout at widths from 320 to 1150 px.

## 2.0.0 — Stable

Promote 2.0.0-beta.3 to the stable version 2 release, retaining its behavior and configuration. Existing version 1 and version 2 beta card settings are preserved.

- Configure up to 20 home consumers through the visual editor; display the six strongest active devices without scrolling.
- Use one orthogonal home feeder per row and short vertical branches in the home color; keep independent consumer border colors and a solid, stationary home outline.
- Fill the lower row first, retain tile positions during strongest-six replacements, and shrink the card by 93 px for each unused consumer row.
- Choose colors visually with twelve swatches, a native picker, live hue/saturation/brightness mixing, preview and HEX output, or use existing CSS text color fields.
- Keep independent XT60(1)/XT60(2) readings, automatic home power calculation, battery charge icons and wattage-dependent flow and source-outline animation.
- Update Ukrainian and English installation and upgrade guides for the stable release; remove the beta label from the card picker.
- Validate source/power logic, editor interaction, color mixing, ranking, reduced motion, mobile row fitting and orthogonal layout geometry at 320–1150 px.

## 2.0.0-beta.3 — Pre-release

- Resize the diagram automatically for zero, one or two visible consumer rows; remove 93 px per unused row.
- Move the remaining row and supply blocks upward without changing block sizes, rankings, lower-first filling or orthogonal flow geometry.
- Add a native color picker, twelve preset swatches, live hue/saturation/brightness sliders, a current color preview and HEX display for every source and individual consumer.
- Keep existing text color fields, named colors, HEX/RGB/HSL and alpha input; visual mixing selects an opaque color. Add one-click default restoration.
- Preserve slider focus, color component choices through black/white, opened color panels and Home Assistant configuration feedback.
- Add compact-layout and color-mixer previews, a one-row demo and Ukrainian/English setup instructions.
- Verify all active counts at 320–1150 px, shrinking/growing layouts, node bounds, routes, live color updates, native color entry and default reset.

## 2.0.0-beta.2 — Pre-release

- Replace separate home-to-consumer feeds with one shared line per row and short vertical branches.
- Use the home color for both shared row lines and all branches; retain independent consumer border colors.
- Fill the lower row first, then the upper row. Compact gaps downward when active devices disappear, while keeping slots stable during strongest-six replacements.
- Keep the home outline solid and stationary in every supply state.
- Drive shared feeder speed from the visible row's total wattage and each branch from its own consumer power.
- Preserve card height, twenty configurable consumers, six strongest active devices, right-angle routes and existing station configuration.
- Verify sparse counts, source-dependent line colors, fixed home outline and orthogonal route geometry at phone and desktop widths.


## 2.0.0-beta.1 — Pre-release

This is the first version 2 beta. Layout and settings will continue to evolve. Stable 0.1.12 remains available.

- Configure up to 20 individual consumers in the visual editor: name, power entity, Home Assistant icon and independent CSS color.
- Show the six active consumers with the highest power in two rows of three. Replace the weakest when a stronger device becomes active; retain other tile positions and existing devices when power is tied.
- Match each consumer border and its orthogonal home feed to that consumer's color. Animate each line using its own wattage.
- Move auxiliary stations to either side of the main station, preserving the diagram height. Keep all lines horizontal and vertical, without crossing node interiors.
- Animate the home outline clockwise while it supplies visible consumers. Preserve reduced-motion behavior and live animation continuity.
- Keep version 1 station entities, names, colors and flow settings. Consumer readings do not change the home power calculation.
- Add beginner installation, beta opt-in, migration, rollback and consumer configuration guides in Ukrainian and English.
- Verify twenty-device limits, ranking and replacement, visual editor typing and color drafts, persistence, mobile layouts from 320 px, wider layouts through 1150 px, route geometry, more-info and reduced motion.


## 0.1.12

- Animate a dashed outline clockwise around each block supplying an active outgoing energy flow.
- Keep the configured block color and use outgoing wattage to adjust the outline speed without restarting it.
- Restore solid outlines when supply stops; keep the home outline solid and respect reduced motion.

## 0.1.11

- Keep every reading on one line in all five blocks, including both upper stations, without widening the blocks.
- Fit only overflowing row text and restore its natural size when space is available.
- Use W and kW in both languages; show power from 1000 W in kW throughout the card.

## 0.1.10

- Restore the original city grid block width to match the home block on mobile.
- Fit the grid output label, value and unit inside the existing block by reducing only overflowing row text.
- Retain kW formatting and the simplified home block.

## 0.1.9

- Remove the home source text row; retain source-based border colors and flow logic.
- Display city grid power from 1000 W in kW with up to two decimals and no grouping.
- Keep the entire grid output row, including its label, value and unit, on one line; widen the grid block in narrow layouts.

## 0.1.8

- Replace moving dots with short dashes without arrows on the same seven orthogonal routes.
- Drive each flow speed from its own wattage with a smooth bounded response and equal visual speed for equal power across different route lengths.
- Change playback speed in place without restarting animation when readings or base movement time change.
- Preserve the existing duration setting as the global base movement time and update Ukrainian and English editor labels.
- Pause inactive and unavailable flows, honor reduced motion, and suspend animations while the card is disconnected.
- Verify per-flow power selection, live speed changes, direction, editor stability and responsive layouts.

## 0.1.7

- Route all seven flows along horizontal and vertical segments with sharp 90-degree corners.
- Give the city grid separate lines to each station and home; remove the route above the auxiliary stations.
- Make the first auxiliary station's transfer to the main station a single straight vertical line.
- Simplify the main station's home feed to one corner, entering home from below.
- Reserve enough vertical space for routes to stay clear of unrelated blocks on medium-width screens.
- Keep moving flow dots on the same paths and verify connections across desktop and mobile layouts.

## 0.1.6

- Rename the main station's two DC inputs to XT60(1) and XT60(2) in the card and visual editor.
- Fill all three battery icons according to their own charge sensors; show a dash for missing or invalid charge readings.
- Make node backgrounds nearly transparent with a subtle tint from the card theme, including support for gradient backgrounds.
- Hide flow lines beneath node interiors so transparent backgrounds do not expose lines through labels and icons.
- Label home power as Input and remove the approximation symbol from its displayed value while keeping the existing calculation.
- Verify live battery levels, unavailable charge, updated labels and light, dark and gradient themes in the browser.

## 0.1.5

- Keep visual editor fields, focus, cursor and expanded sections while changing configuration.
- Preserve empty and incomplete draft values separately from display defaults; apply changes only once colors and numbers are valid.
- Accept CSS color names, short and alpha HEX, RGB/RGBA and HSL/HSLA values; clearing a color restores its default.
- Update card names, entities and colors in place without rebuilding the preview.
- Add browser regression checks for clearing and typing into fields with Home Assistant-style configuration feedback.

## 0.1.4

- Show two independent solar inputs on the main EcoFlow and add a visual entity selector for each port.
- Sum configured AC and solar inputs when no total input sensor is selected; preserve the existing solar sensor as port 1.
- Determine auxiliary transfer flows only from their own output readings, independently of the main solar ports.
- Add separate colors for each auxiliary station and match source borders, battery icons and outgoing flows.
- Match the home border to its active source color and preserve previous color settings.

## 0.1.3

- Keep home consumption and the grid-to-home flow active when EcoFlow charging inputs are missing or unavailable.
- Count missing charging inputs as zero in the home estimate and subtract available positive charging powers.
- Preserve unavailable readings on station blocks and unknown total grid power.

## 0.1.2

- Determine home power source from grid availability: grid present means grid, grid absent means main EcoFlow.
- Remove separate home source controls from the visual editor; legacy source fields are ignored.
- Keep unknown grid availability distinct from an actual outage.

## 0.1.1

- Home consumption no longer requires a dedicated sensor.
- When on grid, estimate home consumption by subtracting all three station charging powers from total grid power.
- When on the main EcoFlow, use its home feed power or total output.
- Drive home flow animation from the same displayed power.
- Keep unavailable readings unknown and mark grid-derived consumption with ≈.

## 0.1.0

- Initial release of the Home Assistant dashboard card.
- Five square blocks: city grid, home and three EcoFlow stations.
- Animated power flows with mutually exclusive home power sources.
- Per-station input power, output power and battery charge.
- Separate AC and solar input readings for the main station.
- Visual entity editor, Ukrainian and English labels, configurable names and flow colors.
- Responsive layout, unavailable-state handling and power-unit conversion.
- HACS custom repository support.

Validation: JavaScript syntax, model tests and Chromium scenarios with simulated Home Assistant states. Real Home Assistant entity selectors still require verification after installation.



</details>

</details>
