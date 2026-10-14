# 2.1.3-beta.1 — Station spacing / Відстані між станціями

## Українська

Бета на базі стабільної 2.1.1.

- Повністю прибрано рядок «Мережа» з головної станції в обох виглядах. Датчик AC-входу залишається в налаштуваннях для розрахунків та потоку мережа → головна станція.
- У боковому вигляді потік місто → дім виходить із середини правої сторони міського блоку, зокрема з увімкненою назвою над ним.
- Обидві допоміжні станції ширші; показники kW розташовані в одному рядку зі своїми підписами. Ширина не змінюється від показань датчиків; шрифт збережено.
- Міський блок трохи піднято. Від міста до головної станції та від головної до допоміжних залишено щонайменше 44 px для видимого потоку.
- На вузькому екрані допоміжні станції розміщуються нижче стовпчика приладів, якщо їхня ширина потребує цього простору.

У HACS відкрий повторне завантаження картки, увімкни показ бета-версій та вибери **2.1.3-beta.1**. Після встановлення перезавантаж інтерфейс Home Assistant. Стабільний реліз — **2.1.1**.

<img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.3-beta.1/preview-sideflow-charging-uk.png" width="390" alt="Боковий потік: заряджання головної станції без рядка Мережа">
<img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.3-beta.1/preview-sideflow-stations-uk.png" width="390" alt="Ширші допоміжні станції з показниками kW">

## English

Beta based on stable 2.1.1.

- Remove the Grid row completely from the main station in both layouts. Keep the AC input entity in the editor for calculations and the grid-to-main flow.
- In Side flow, the city-to-Home route leaves the midpoint of the city block's right border, including when its custom name is visible.
- Widen both auxiliary stations so kW readings stay on one line with their labels. Sensor readings never resize station widths; text retains its existing size.
- Move the city block slightly upward. Keep at least 44 px between the city and main station, and between the main and auxiliary stations, for visible energy flows.
- On narrow screens, place the auxiliaries below the device column when their width requires that space.

In HACS, open the card's redownload dialog, enable beta versions and select **2.1.3-beta.1**. Reload the Home Assistant frontend after installation. The stable release remains **2.1.1**.

<img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.3-beta.1/preview-sideflow-charging-en.png" width="390" alt="Side flow: main station charging without a Grid row">
<img src="https://raw.githubusercontent.com/Suris2009/suris-ecoflow-flow-card/v2.1.3-beta.1/preview-sideflow-stations-en.png" width="390" alt="Wider auxiliary stations with kW readings">
