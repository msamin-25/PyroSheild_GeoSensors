"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Maximize2, Minus, Plus } from "lucide-react";
import { CLASS_LABEL, nodeHex } from "@/lib/ui";
import { matchesFilter, type BaseLayer, type NodeFilter, type NodeRow } from "./types";


const TILES: Record<BaseLayer, { url: string; attribution: string; maxNativeZoom: number }> = {
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
    maxNativeZoom: 16,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxNativeZoom: 17,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    maxNativeZoom: 18,
  },
};

interface Props {
  corridor: [number, number][];
  nodes: NodeRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  layer: BaseLayer;
  filter: NodeFilter;
}

const pulseIcon = (color: string, size: number) =>
  L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="pulse-ring" style="display:block;width:${size}px;height:${size}px;border-radius:9999px;border:2px solid ${color};box-shadow:0 0 12px ${color}"></span>`,
  });

/** Pans to the selected node once per selection (not on every poll refresh). */
function FlyTo({ target }: { target: { id: string; lat: number; lng: number } | null }) {
  const map = useMap();
  const id = target?.id;
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-fly only when the selection changes
  }, [map, id]);
  return null;
}

function ZoomControls({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  const btn = "grid size-9 place-items-center text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg";
  return (
    <div
      ref={(el) => {
        if (el) L.DomEvent.disableClickPropagation(el).disableScrollPropagation(el);
      }}
      className="leaflet-bottom leaflet-right !pointer-events-auto mb-8 mr-3"
    >
      <div className="flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-border-strong bg-overlay shadow-md backdrop-blur-md">
        <button className={btn} onClick={() => map.zoomIn()} aria-label="Zoom in">
          <Plus size={16} />
        </button>
        <button className={`${btn} border-y border-border`} onClick={() => map.zoomOut()} aria-label="Zoom out">
          <Minus size={16} />
        </button>
        <button className={btn} onClick={() => map.flyToBounds(bounds, { duration: 0.8 })} aria-label="Fit corridor">
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CorridorMap({ corridor, nodes, selectedId, onSelect, layer, filter }: Props) {
  const [renderer] = useState(() => L.canvas({ padding: 0.5 }));
  const bounds = useMemo(() => L.latLngBounds(corridor).pad(0.06), [corridor]);
  const selected = nodes.find((n) => n.id === selectedId);
  const hot = nodes.filter((n) => n.level !== "normal");
  const tiles = TILES[layer];

  return (
    <MapContainer bounds={bounds} className="h-full w-full" preferCanvas zoomControl={false} attributionControl>
      <TileLayer key={layer} url={tiles.url} attribution={tiles.attribution} maxNativeZoom={tiles.maxNativeZoom} maxZoom={18} />

      <Polyline positions={corridor} pathOptions={{ color: "#7ee08f", weight: 18, opacity: 0.06 }} />
      <Polyline positions={corridor} pathOptions={{ color: "#a4f0ad", weight: 1.25, opacity: 0.55, dashArray: "2 6" }} />

      {nodes.map((n) => {
        const color = nodeHex(n.level, n.classification);
        const isSel = n.id === selectedId;
        const match = matchesFilter(n, filter);
        const radius = isSel ? 9 : n.level === "critical" ? 8 : n.level !== "normal" ? 7 : n.classification === "nominal" ? 3.5 : 5;
        return (
          <CircleMarker
            key={n.id}
            center={[n.lat, n.lng]}
            radius={radius}
            renderer={renderer}
            pathOptions={{
              color: isSel ? "#ffffff" : color,
              weight: isSel ? 2.5 : n.level === "normal" ? 0 : 1.5,
              fillColor: color,
              fillOpacity: !match ? 0.08 : n.online ? 0.92 : 0.45,
              opacity: match ? 1 : 0.1,
            }}
            eventHandlers={{ click: () => onSelect(n.id) }}
          >
            <Tooltip className="node-tip" direction="top" offset={[0, -8]}>
              <div className="font-mono text-[12px] font-medium">{n.id}</div>
              <div className="mt-0.5 text-[11px]" style={{ color }}>
                {CLASS_LABEL[n.classification]}
              </div>
              <div className="mt-1 font-mono text-[11px] text-fg-3">
                risk {n.score} · CO {n.coPpm} ppm · {n.soil30C} °C
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {hot
        .filter((n) => matchesFilter(n, filter))
        .map((n) => (
          <Marker
            key={`pulse-${n.id}`}
            position={[n.lat, n.lng]}
            icon={pulseIcon(nodeHex(n.level, n.classification), n.level === "critical" ? 34 : 26)}
            eventHandlers={{ click: () => onSelect(n.id) }}
            interactive
          />
        ))}

      <ZoomControls bounds={bounds} />
      <FlyTo target={selected ?? null} />
    </MapContainer>
  );
}
