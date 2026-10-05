# Changelog

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
