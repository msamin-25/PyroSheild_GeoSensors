/**
 * PyroShield G1 "Geo-Spike" reference design.
 * Model units: 1 unit = 10 cm. y = 0 is the soil surface
 */

export interface HardwarePart {
  id: string;
  n: number;
  name: string;
  material: string;
  role: string;
  spec: string;
  /** Displacement in the exploded view, model units. */
  explodeY: number;
  explodeX?: number;
  /** Hotspot anchor in the assembled pose, model units. */
  label: [number, number, number];
}

export const PARTS: HardwarePart[] = [
  {
    id: "radome",
    n: 1,
    name: "Antenna radome",
    material: "PHA bio-resin, UV-stabilised with lignin",
    role: "Weatherproof cover over the satellite antenna. RF-transparent at 400 MHz–1.6 GHz and sheds snow and needles.",
    spec: "Ø 84 mm · 2.0 mm wall · IP68",
    explodeY: 2.5,
    label: [0, 1.62, 0],
  },
  {
    id: "antenna",
    n: 2,
    name: "LEO satellite antenna",
    material: "Copper helix on cellulose former",
    role: "Quadrifilar helix for direct-to-satellite IoT uplinks. Gives a near-hemispherical pattern, so it works even if the node lands up to 25° off vertical.",
    spec: "+1.5 dBic · 10–25 kbit/s burst · 4 packets/day nominal, on-event immediate",
    explodeY: 2.0,
    label: [0.24, 1.3, 0],
  },
  {
    id: "fins",
    n: 3,
    name: "Samara drop stabilisers",
    material: "Flax-fibre / PLA composite",
    role: "Four canted vanes spin the node during free fall (inspired by maple seeds). This keeps it vertical and caps terminal velocity at about 22 m/s, so it drives tip-first into the duff layer.",
    spec: "Span 180 mm · 18° cant · terminal velocity ≈ 22 m/s",
    explodeY: 1.6,
    label: [0.9, 1.25, 0],
  },
  {
    id: "heatsink",
    n: 4,
    name: "Air-side heat sink",
    material: "Bioresorbable magnesium alloy (WE43)",
    role: "Cold side of the thermoelectric stack. Twelve radial fins couple the TEG to ambient air, so the air–soil temperature difference becomes usable power.",
    spec: "12 fins · 0.11 m² surface · 0.9 K/W",
    explodeY: 1.0,
    label: [0.55, 0.55, 0],
  },
  {
    id: "electronics",
    n: 5,
    name: "Electronics core",
    material: "FR-4-free cellulose PCB · conformal-coated",
    role: "Three-board stack: ultra-low-power MCU with on-device signature model, satellite modem, and a cold-start PMIC that boosts from 20 mV TEG output.",
    spec: "Sleep 1.8 µA · Cortex-M33 · boost from 20 mV · 6-axis IMU for landing check",
    explodeY: 0.9,
    explodeX: -1.15,
    label: [-0.32, 0.8, 0],
  },
  {
    id: "supercap",
    n: 6,
    name: "Supercapacitor bank",
    material: "Activated-carbon / aqueous electrolyte",
    role: "Battery-free energy store. Buffers harvest for satellite bursts (≈ 2 J each) and rides through calm nights when ΔT ≈ 0.",
    spec: "2 × 3 F, 2.7 V · ≈ 20 J usable · −40 to +85 °C · > 500k cycles",
    explodeY: 0.6,
    explodeX: 1.15,
    label: [0.12, 0.55, 0],
  },
  {
    id: "teg",
    n: 7,
    name: "Thermoelectric generator",
    material: "Bi₂Te₃ module in ceramic sandwich",
    role: "Converts the gradient between the air-side heat sink and the soil-coupled thermal rod into continuous power. No battery, no solar panel to be shaded by canopy.",
    spec: "40 × 40 mm · ≈ 9 µW/K² matched · 140 µW avg at ΔT 4 K",
    explodeY: 0.45,
    label: [0.38, 0.14, 0],
  },
  {
    id: "collar",
    n: 8,
    name: "Depth-stop collar",
    material: "Mycelium-hemp composite with anchor barbs",
    role: "Stops penetration at the design depth, seals the borehole against surface water, and resists frost heave and animal disturbance.",
    spec: "Ø 124 mm · 3 anchor barbs · sets 30 cm probe depth",
    explodeY: 0,
    label: [0.62, 0.03, 0],
  },
  {
    id: "rod",
    n: 9,
    name: "Thermal conduction rod",
    material: "Zinc alloy (bioresorbable), graphite-sleeved",
    role: "Carries stable deep-soil temperature up to the TEG hot side. Also acts as the ground plane for the antenna.",
    spec: "Ø 12 mm × 300 mm · 110 W/m·K",
    explodeY: -0.5,
    label: [0, -1.9, 0.2],
  },
  {
    id: "gas",
    n: 10,
    name: "Soil-gas sensing port",
    material: "ePTFE-free cellulose membrane window",
    role: "Diffusion window at 10 cm feeding an electrochemical CO cell (0–1000 ppm) and a MEMS metal-oxide VOC sensor. Hydrophobic membrane blocks water and fines.",
    spec: "CO ±0.5 ppm · VOC 5–5000 ppb · 8 diffusion apertures",
    explodeY: -1.0,
    label: [0.28, -1.0, 0],
  },
  {
    id: "thermistors",
    n: 11,
    name: "Thermistor array",
    material: "NTC thermistors in zinc sense bands",
    role: "Measures the soil temperature profile at 5, 15 and 30 cm. An inversion (deep warmer than shallow) is the earliest signature of root-zone smoldering.",
    spec: "±0.05 °C · 3 depths · 15-min sampling, 1-min in alert mode",
    explodeY: -1.0,
    label: [0.24, -3.0, 0],
  },
  {
    id: "spike",
    n: 12,
    name: "Bio-composite spike body",
    material: "PLA / flax / mycelium, 10-year hydrolysis profile",
    role: "Structural probe that carries the sensors to depth. Formulated to stay sealed for the 10-year service life, then hydrolyse to CO₂, water and biomass with no persistent microplastics.",
    spec: "310 mm body + 50 mm tip · taper Ø 58 → 32 mm",
    explodeY: -1.0,
    label: [-0.3, -2.2, 0],
  },
  {
    id: "tip",
    n: 13,
    name: "Penetrator tip",
    material: "Zinc-iron bioresorbable alloy",
    role: "Hardened ogive tip that punches through the litter and duff layer and into the mineral soil on impact.",
    spec: "60 mm ogive · penetrates ~0.6 MPa soils at 22 m/s",
    explodeY: -1.6,
    label: [0.12, -3.4, 0],
  },
];

export const SPECS: [string, string][] = [
  ["Overall length", "510 mm (360 mm below grade, 150 mm above)"],
  ["Mass", "340 g"],
  ["Power", "Thermoelectric harvest only — no battery"],
  ["Energy store", "2 × 3 F supercapacitors (≈ 20 J usable)"],
  ["Uplink", "Direct-to-LEO satellite IoT, 4/day nominal + immediate on alert"],
  ["Sensing", "Soil T at 5/15/30 cm · air T · CO · VOC · soil moisture · IMU"],
  ["Service life", "10 years, then biodegrades in situ"],
  ["Operating range", "−40 °C to +85 °C (sensors survive 300 °C for 10 min)"],
  ["Deployment", "Aerial drop 40–120 m AGL, or hand-set by ground crew"],
  ["Density", "1 node per 2 ha (≈ 80 m detection radius) across a 300 m corridor buffer"],
];

/** Daily energy budget at ΔT = 4 K (average shoulder-season conditions). */
export const POWER_BUDGET: { item: string; uW: number }[] = [
  { item: "MCU + PMIC sleep floor", uW: 6 },
  { item: "Thermistor + moisture sampling (15 min)", uW: 2 },
  { item: "Electrochemical CO cell (passive bias)", uW: 4 },
  { item: "MOx VOC heater pulses (0.5 s / 15 min)", uW: 9 },
  { item: "Satellite uplinks (4 × 2 J / day)", uW: 93 },
];
export const HARVEST_UW = 140;
