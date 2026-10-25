# PyroShield Geo-Sensors

Web platform for PyroShield: battery-free, biodegradable soil sensor nodes, dropped by aircraft along high-risk forest corridors, that detect subterranean smoldering hours before a wildfire breaks through the canopy.

| Page | What it is |
| --- | --- |
| `/` | Overview: problem, how detection works, wedge, business model and killer assumptions |
| `/dashboard` | Operations console: a live map of 1,185 nodes along the Merritt–Kamloops 230 kV corridor, an alert queue, and per-node telemetry with an explainable risk breakdown |
| `/hardware` | Interactive 3D model of the G1 "Geo-Spike" node, with exploded view, cutaway, soil cross-section, part-by-part specs and energy budget |
| `/install` | Field guide covering site planning, aerial drop, ground setting, acceptance and maintenance, plus a deployment and pricing planner |

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Requires Node 20.9+.

## Architecture

```
src/lib/
  sim.ts         Digital-twin simulator: corridor geometry, node layout, deterministic telemetry + scenarios
  detection.ts   Combustion-signature model: explainable 0–100 score, biogenic gate, plume detection
  network.ts     Snapshot per 15-min step: neighbour corroboration, assessments, alert derivation
  hardware.ts    G1 node reference design: parts, specs, power budget
src/app/api/
  network/       GET  compact status for every node
  alerts/        GET  ranked fire + maintenance alerts
  nodes/[id]/    GET  node detail, assessment and telemetry (?hours=1–48)
  ingest/        POST score a decoded satellite uplink packet
```

### Telemetry is simulated (for now)

Until field hardware exists, `sim.ts` produces telemetry as a pure function of `(node, timestamp)`. Every server instance therefore returns the same data, and the network changes in real time without a database. The demo includes these scenarios:

- **PS-SL-028**: subterranean smoldering (critical), with downwind gas plume on its neighbours
- **PS-KR-041**: early root-zone thermal anomaly (warning)
- **PS-NV-024**: post-rain litter decomposition, which the model suppresses as biogenic (the false-positive case)
- **PS-NV-077 / PS-KR-090**: missed satellite uplinks
- **PS-SL-063**: low energy reserve from a shaded site

### Detection model

`detection.ts` scores each node against its own 42-hour baseline. Each factor contributes named points, so a dispatcher can see why an alert fired:

| Factor | Max points |
| --- | --- |
| Root-zone heat anomaly at 30 cm | 32 |
| CO above baseline | 18 |
| Thermal gradient inversion (30 cm warmer than 5 cm) | 14 |
| CO rate of rise | 12 |
| Neighbour corroboration within 400 m | 12 |
| CO:VOC combustion ratio | 10 |
| Soil moisture | −15 to +6 |

Two rules catch false positives:

- **Biogenic gate**: gas without heat (decomposition) is capped below the alert threshold.
- **Plume**: gas without local heat but with a heating neighbour is classed as drift.

Levels are watch ≥ 30, warning ≥ 55 and critical ≥ 80. The weights are hand-tuned placeholders until field burn-trial data is available to train them.

### Connecting real hardware

`POST /api/ingest` accepts a decoded uplink from the satellite ground-station webhook:

```json
{ "nodeId": "PS-SL-028", "readings": [{ "t": "2026-10-05T12:00:00Z", "airTempC": 14.2, "soil5C": 12.1, "soil15C": 11.4,
  "soil30C": 10.6, "coPpm": 0.4, "vocPpb": 45, "soilMoisturePct": 18, "harvestUw": 120, "supercapV": 2.71 }, "…≥16 samples"] }
```

It validates the packet and returns the assessment, but it does not store anything yet. Going to production means adding a time-series store, persisting packets in `ingest`, and reading `getSeries` from that store instead of `sim.ts`.
