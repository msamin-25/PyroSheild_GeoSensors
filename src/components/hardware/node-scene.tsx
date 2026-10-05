"use client";

import { createContext, useContext, useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { CatmullRomCurve3, DoubleSide, FrontSide, Group, LatheGeometry, Plane, Vector2, Vector3 } from "three";
import { PARTS, type HardwarePart } from "@/lib/hardware";

export interface SceneOptions {
  explode: number;
  cutaway: boolean;
  soil: boolean;
  labels: boolean;
  autoRotate: boolean;
}

interface Props extends SceneOptions {
  selected: string | null;
  hovered: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

/** Keeps z ≤ 0: removes the front half of shell parts to reveal internals. */
const CUT_PLANE = new Plane(new Vector3(0, 0, -1), 0);

const PartCtx = createContext({ active: false, cutaway: false });

const SPIKE_TOP = 0;
const SPIKE_BOTTOM = -3.1;
const R_TOP = 0.29;
const R_BOTTOM = 0.16;
const spikeR = (y: number) => R_TOP + (R_BOTTOM - R_TOP) * ((SPIKE_TOP - y) / (SPIKE_TOP - SPIKE_BOTTOM));

function Mat({
  color,
  metalness = 0.05,
  roughness = 0.75,
  shell = false,
  opacity,
}: {
  color: string;
  metalness?: number;
  roughness?: number;
  shell?: boolean;
  opacity?: number;
}) {
  const { active, cutaway } = useContext(PartCtx);
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={active ? "#ff6a2b" : "#000000"}
      emissiveIntensity={active ? 0.55 : 0}
      clippingPlanes={shell && cutaway ? [CUT_PLANE] : []}
      side={shell ? DoubleSide : FrontSide}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  );
}

function Part({ part, explode, children, ...p }: { part: HardwarePart; explode: number; children: React.ReactNode } & Omit<Props, keyof SceneOptions> & { cutaway: boolean; labels: boolean }) {
  const ref = useRef<Group>(null);
  const active = p.selected === part.id || p.hovered === part.id;

  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = Math.min(1, dt * 8);
    ref.current.position.y += (part.explodeY * explode - ref.current.position.y) * k;
    ref.current.position.x += ((part.explodeX ?? 0) * explode - ref.current.position.x) * k;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    p.onHover(part.id);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    p.onHover(null);
    document.body.style.cursor = "";
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    p.onSelect(p.selected === part.id ? null : part.id);
  };

  return (
    <PartCtx.Provider value={{ active, cutaway: p.cutaway }}>
      <group ref={ref} onPointerOver={over} onPointerOut={out} onClick={click}>
        {children}
        {p.labels && (
          <Html position={part.label} center zIndexRange={[20, 0]}>
            <button
              onClick={() => p.onSelect(p.selected === part.id ? null : part.id)}
              className={`grid size-5 place-items-center rounded-full border text-[10px] font-semibold transition-colors ${
                active ? "border-ember bg-ember text-black" : "border-white/40 bg-black/70 text-white hover:border-ember"
              }`}
              aria-label={part.name}
            >
              {part.n}
            </button>
          </Html>
        )}
      </group>
    </PartCtx.Provider>
  );
}

function Helix({ phase }: { phase: number }) {
  const geo = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const a = phase + t * Math.PI * 3;
      pts.push(new Vector3(Math.cos(a) * 0.19, 1.14 + t * 0.26, Math.sin(a) * 0.19));
    }
    return new CatmullRomCurve3(pts);
  }, [phase]);
  return (
    <mesh>
      <tubeGeometry args={[geo, 120, 0.012, 6, false]} />
      <Mat color="#c87533" metalness={0.8} roughness={0.3} />
    </mesh>
  );
}

function Spike() {
  const geo = useMemo(() => {
    const pts: Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const y = SPIKE_TOP + ((SPIKE_BOTTOM - SPIKE_TOP) * i) / 12;
      pts.push(new Vector2(spikeR(y), y));
    }
    return new LatheGeometry(pts.reverse(), 48);
  }, []);
  return (
    <mesh geometry={geo}>
      <Mat color="#a88b62" roughness={0.9} shell />
    </mesh>
  );
}

function Band({ y, h, color, metal = 0.6, extra = 0.012 }: { y: number; h: number; color: string; metal?: number; extra?: number }) {
  const r = spikeR(y) + extra;
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry args={[r, r, h, 40, 1, true]} />
      <Mat color={color} metalness={metal} roughness={0.35} shell />
    </mesh>
  );
}

function PartGeometry({ id }: { id: string }) {
  switch (id) {
    case "radome":
      return (
        <group>
          <mesh position={[0, 1.09, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.08, 48, 1, true]} />
            <Mat color="#e9e4d6" shell />
          </mesh>
          <mesh position={[0, 1.13, 0]} scale={[1, 0.9, 1]}>
            <sphereGeometry args={[0.42, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color="#e9e4d6" roughness={0.5} shell />
          </mesh>
        </group>
      );
    case "antenna":
      return (
        <group>
          {[0, 1, 2, 3].map((i) => (
            <Helix key={i} phase={(i * Math.PI) / 2} />
          ))}
          <mesh position={[0, 1.13, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
            <Mat color="#3d5a3c" />
          </mesh>
        </group>
      );
    case "fins":
      return (
        <group>
          <mesh position={[0, 1.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.43, 0.025, 10, 48]} />
            <Mat color="#c9b48a" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
              <mesh position={[0.7, 1.18, 0]} rotation={[0.32, 0, 0]}>
                <boxGeometry args={[0.56, 0.36, 0.018]} />
                <Mat color="#c9b48a" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "heatsink":
      return (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.92, 48, 1, true]} />
            <Mat color="#9aa3a6" metalness={0.75} roughness={0.35} shell />
          </mesh>
          {Array.from({ length: 12 }, (_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 6, 0]}>
              <mesh position={[0.41, 0.6, 0]}>
                <boxGeometry args={[0.22, 0.78, 0.022]} />
                <Mat color="#b4bcbf" metalness={0.75} roughness={0.35} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "electronics":
      return (
        <group>
          {[0.7, 0.82, 0.94].map((y, i) => (
            <group key={y}>
              <mesh position={[0, y, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.022, 40]} />
                <Mat color="#2f6b45" roughness={0.6} />
              </mesh>
              <mesh position={[0.06 - i * 0.05, y + 0.025, 0.04]}>
                <boxGeometry args={[0.1, 0.03, 0.1]} />
                <Mat color="#1b1b1b" roughness={0.4} />
              </mesh>
              <mesh position={[-0.12, y + 0.02, -0.06 + i * 0.03]}>
                <boxGeometry args={[0.06, 0.02, 0.05]} />
                <Mat color="#c0c0c0" metalness={0.6} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "supercap":
      return (
        <group>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.42, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.36, 24]} />
              <Mat color="#2b4a8a" metalness={0.3} roughness={0.4} />
            </mesh>
          ))}
        </group>
      );
    case "teg":
      return (
        <group>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.08, 48]} />
            <Mat color="#f1efe8" roughness={0.6} />
          </mesh>
          {Array.from({ length: 16 }, (_, i) => (
            <mesh key={i} position={[((i % 4) - 1.5) * 0.11, 0.135, (Math.floor(i / 4) - 1.5) * 0.11]}>
              <boxGeometry args={[0.07, 0.012, 0.07]} />
              <Mat color="#3a3a3a" />
            </mesh>
          ))}
        </group>
      );
    case "collar":
      return (
        <group>
          <mesh position={[0, 0.025, 0]}>
            <cylinderGeometry args={[0.62, 0.6, 0.05, 56]} />
            <Mat color="#7a5c3c" roughness={0.95} shell />
          </mesh>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[0, (i * 2 * Math.PI) / 3, 0]}>
              <mesh position={[0.46, -0.11, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.04, 0.22, 12]} />
                <Mat color="#7a5c3c" />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "rod":
      return (
        <mesh position={[0, -1.44, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.12, 20]} />
          <Mat color="#8e9aa0" metalness={0.8} roughness={0.3} />
        </mesh>
      );
    case "gas":
      return (
        <group>
          <Band y={-1.0} h={0.16} color="#2a2a2a" metal={0.1} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const r = spikeR(-1.0) + 0.014;
            return (
              <mesh key={i} position={[Math.cos(a) * r, -1.0, Math.sin(a) * r]} rotation={[0, -a, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.006, 12]} />
                <Mat color="#f2f2f2" />
              </mesh>
            );
          })}
        </group>
      );
    case "thermistors":
      return (
        <group>
          {[-0.5, -1.5, -3.0].map((y) => (
            <Band key={y} y={y} h={0.05} color="#d8a24a" />
          ))}
        </group>
      );
    case "spike":
      return <Spike />;
    case "tip":
      return (
        <mesh position={[0, SPIKE_BOTTOM - 0.25, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[R_BOTTOM, 0.5, 40]} />
          <Mat color="#6d7377" metalness={0.7} roughness={0.35} />
        </mesh>
      );
    default:
      return null;
  }
}

function Soil({ labels }: { labels: boolean }) {
  // Cross-section block behind the probe's centre plane (z ≤ 0).
  const layers: [number, number, string, string][] = [
    [0, -0.4, "#3b2a1a", "Litter & duff"],
    [-0.4, -1.8, "#4a3524", "A horizon"],
    [-1.8, -4.2, "#6b4e33", "B horizon"],
  ];
  const depths: [number, string][] = [
    [-0.5, "5 cm"],
    [-1.5, "15 cm"],
    [-3.0, "30 cm"],
  ];
  return (
    <group>
      {layers.map(([top, bottom, color, name]) => (
        <group key={name}>
          <mesh position={[0, (top + bottom) / 2, -1.25]}>
            <boxGeometry args={[5, top - bottom, 2.5]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
          {labels && (
            <Html position={[2.45, (top + bottom) / 2, 0]} zIndexRange={[10, 0]}>
              <span className="whitespace-nowrap text-[10px] text-white/60">{name}</span>
            </Html>
          )}
        </group>
      ))}
      <mesh position={[0, 0.005, -1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 2.5]} />
        <meshStandardMaterial color="#33461f" roughness={1} />
      </mesh>
      {depths.map(([y, label]) => (
        <group key={label}>
          <mesh position={[-1.3, y, 0.001]}>
            <planeGeometry args={[1.6, 0.012]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
          </mesh>
          {labels && (
            <Html position={[-2.15, y, 0]} center zIndexRange={[10, 0]}>
              <span className="whitespace-nowrap font-mono text-[10px] text-white/70">{label}</span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

/** Shrinks and recentres the model as it explodes so every part stays in frame. */
function ModelRig({ explode, children }: { explode: number; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = Math.min(1, dt * 8);
    const scale = 1 / (1 + 0.6 * explode);
    const y = 0.4 - 0.6 * explode;
    ref.current.scale.setScalar(ref.current.scale.x + (scale - ref.current.scale.x) * k);
    ref.current.position.y += (y - ref.current.position.y) * k;
  });
  return (
    <group ref={ref} position={[0, 0.4, 0]}>
      {children}
    </group>
  );
}

export default function NodeScene(props: Props) {
  const { explode, soil, labels, autoRotate } = props;
  const showSoil = soil && explode < 0.05;
  return (
    <Canvas
      camera={{ position: [6.5, 1.8, 9.5], fov: 34 }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <color attach="background" args={["#0d120e"]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#dbe8ff", "#3a2a1a", 0.7]} />
      <directionalLight position={[5, 8, 6]} intensity={1.8} />
      <directionalLight position={[-6, 2, -4]} intensity={0.5} color="#ffb38a" />

      <ModelRig explode={explode}>
        {PARTS.map((part) => (
          <Part key={part.id} part={part} {...props}>
            <PartGeometry id={part.id} />
          </Part>
        ))}
        {showSoil && <Soil labels={labels} />}
      </ModelRig>

      <OrbitControls
        target={[0, -0.6, 0]}
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        autoRotate={autoRotate}
        autoRotateSpeed={0.7}
        makeDefault
      />
    </Canvas>
  );
}
