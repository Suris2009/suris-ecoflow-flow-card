# Changelog

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
