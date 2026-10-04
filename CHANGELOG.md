# Changelog

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
