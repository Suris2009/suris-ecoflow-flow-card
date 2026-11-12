# 2.1.5-beta.1 — Потужність станцій і споживання дому / Station power and Home consumption

## Українська

- Головна EcoFlow показує окремі AC IN, XT60(1), XT60(2) і AC OUT на дім.
- У першої допоміжної станції (DELTA Max 2000) два поля потужності — AC IN від міста та AC OUT на головну. Підказка AC IN показує власне споживання з міста як AC IN − AC OUT.
- У редакторі прибрано «Вхід дому». Споживання від міста розраховується з відніманням повного AC IN станцій, а від EcoFlow дорівнює AC OUT головної.

Після оновлення перевір, що у DELTA Max поле **«Вхід з міста»** прив’язане до **AC In Power**. Для стандартних ідентифікаторів картка замінює старий `Total In Power` відповідним AC-входом. Якщо датчик перейменовано, вибери його в редакторі.

## English

- The main EcoFlow shows separate AC IN, XT60(1), XT60(2), and AC OUT to Home readings.
- The first auxiliary (DELTA Max 2000) has two power fields, grid AC IN and AC OUT to the main EcoFlow. The AC IN tooltip shows station consumption from the grid as AC IN − AC OUT.
- Home consumption is calculated. It uses the grid meter minus full station grid input, or the main EcoFlow’s AC OUT when it supplies Home.

After updating, check that the DELTA Max **Grid input** points to **AC In Power**. Standard entity IDs migrate from `Total In Power` to the matching AC input. Select the sensor in the editor if the entity has been renamed.
