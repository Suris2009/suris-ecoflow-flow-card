# Changelog

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
