"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { CircleMarker, LayersControl, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { CLASS_LABEL, nodeHex } from "@/lib/ui";
import type { NodeRow } from "./types";

interface Props {
  corridor: [number, number][];
  nodes: NodeRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const pulseIcon = (color: string) =>
  L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<span class="pulse-ring" style="display:block;width:28px;height:28px;border-radius:9999px;border:2px solid ${color}"></span>`,
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

export default function CorridorMap({ corridor, nodes, selectedId, onSelect }: Props) {
  const [renderer] = useState(() => L.canvas({ padding: 0.5 }));
  const selected = nodes.find((n) => n.id === selectedId);
  const hot = nodes.filter((n) => n.level !== "normal");

  return (
    <MapContainer
      bounds={L.latLngBounds(corridor).pad(0.08)}
      className="h-full w-full"
      preferCanvas
      zoomControl={false}
      attributionControl
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Dark">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
            maxNativeZoom={16}
            maxZoom={18}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Terrain">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            maxNativeZoom={17}
            maxZoom={18}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
            maxZoom={18}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <Polyline positions={corridor} pathOptions={{ color: "#ff6a2b", weight: 14, opacity: 0.08 }} />
      <Polyline positions={corridor} pathOptions={{ color: "#ff6a2b", weight: 1.5, opacity: 0.7, dashArray: "6 6" }} />

      {nodes.map((n) => {
        const color = nodeHex(n.level, n.classification);
        const isSel = n.id === selectedId;
        return (
          <CircleMarker
            key={n.id}
            center={[n.lat, n.lng]}
            radius={isSel ? 8 : n.level === "normal" ? 4 : 7}
            renderer={renderer}
            pathOptions={{
              color: isSel ? "#ffffff" : color,
              weight: isSel ? 2.5 : 1,
              fillColor: color,
              fillOpacity: n.online ? 0.9 : 0.35,
            }}
            eventHandlers={{ click: () => onSelect(n.id) }}
          >
            <Tooltip className="node-tip" direction="top" offset={[0, -6]}>
              <b>{n.id}</b> · {CLASS_LABEL[n.classification]}
              <br />
              Risk {n.score} · CO {n.coPpm} ppm · 30 cm {n.soil30C} °C
            </Tooltip>
          </CircleMarker>
        );
      })}

      {hot.map((n) => (
        <Marker
          key={`pulse-${n.id}`}
          position={[n.lat, n.lng]}
          icon={pulseIcon(nodeHex(n.level, n.classification))}
          eventHandlers={{ click: () => onSelect(n.id) }}
        />
      ))}

      <FlyTo target={selected ?? null} />
    </MapContainer>
  );
}
