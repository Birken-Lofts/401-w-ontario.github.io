'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { categories, pois, HOME, type Poi } from '@/data/location';
import MobileMap from '@/components/map/MobileMap';

const colorOf = (catId: string) => categories.find((c) => c.id === catId)?.color ?? '#c67139';
const allOn = () => Object.fromEntries(categories.map((c) => [c.id, true]));

// Below this width the tile map's labels are illegible — the design handoff
// swaps in a dedicated portrait SVG instead of scaling the desktop map down.
const MOBILE_QUERY = '(max-width: 640px)';

export default function NeighborhoodMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ poi: Poi; marker: L.Marker }[]>([]);
  const [active, setActive] = useState<Record<string, boolean>>(allOn);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Initialize the map once (cleaned up fully so StrictMode's double-mount is safe).
  // Re-runs when the mobile SVG swaps in/out so Leaflet tears down and reinitializes.
  useEffect(() => {
    if (!mapEl.current) return;
    const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false }).setView(HOME, 15);
    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Gate scroll-wheel zoom behind a click so the map doesn't hijack page scroll.
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    const homeIcon = L.divIcon({
      className: '',
      html: '<div class="bk-home">BL</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    L.marker(HOME, { icon: homeIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(
        `<b style="font-family:var(--font-heading);font-weight:400;font-size:17px">Birken Lofts</b><br><span style="color:var(--color-neutral-600);font-size:12px">401 W. Ontario Street · River North</span>`,
      );

    markersRef.current = pois.map((poi) => {
      const color = colorOf(poi.cat);
      const icon = L.divIcon({
        className: '',
        html: `<div class="bk-pin" style="background:${color}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker(poi.ll, { icon }).bindPopup(
        `<b style="font-size:14px">${poi.name}</b><br><span style="color:${color};font:600 11px var(--font-body);letter-spacing:.08em;text-transform:uppercase">${poi.walk} min walk</span><br><span style="color:var(--color-neutral-600);font-size:12px">${poi.blurb}</span>`,
      );
      return { poi, marker };
    });

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [isMobile]);

  // Add/remove pins as category filters change (also runs on mount → initial render).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(({ poi, marker }) => {
      const on = active[poi.cat];
      const has = map.hasLayer(marker);
      if (on && !has) marker.addTo(map);
      else if (!on && has) map.removeLayer(marker);
    });
  }, [active]);

  const toggle = (id: string) => setActive((s) => ({ ...s, [id]: !s[id] }));

  const showAllLocations = () => {
    const map = mapRef.current;
    if (!map) return;
    setActive(allOn());
    map.closePopup();
    map.fitBounds(L.latLngBounds([HOME, ...pois.map((poi) => poi.ll)]), {
      animate: true,
      duration: 0.8,
      maxZoom: 15,
      padding: [28, 28],
    });
  };

  const selectPlace = (poi: Poi) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo(poi.ll, 17, { duration: 0.8 });
    const found = markersRef.current.find((m) => m.poi === poi);
    if (found) {
      if (!map.hasLayer(found.marker)) found.marker.addTo(map);
      setTimeout(() => found.marker.openPopup(), 650);
    }
  };

  const visiblePois = pois.filter((p) => active[p.cat]);

  if (isMobile) {
    return (
      <div className="map-frame map-frame--svg">
        <MobileMap />
      </div>
    );
  }

  return (
    <div className="map-frame">
      <div className="map-panel">
        <div className="map-filter-head">
          <div className="map-filter-label">Explore by</div>
          <div className="map-chips">
            <button className="map-chip" onClick={showAllLocations}>All</button>
            {categories.map((c) => {
              const on = active[c.id];
              return (
                <button
                  key={c.id}
                  className="map-chip"
                  onClick={() => toggle(c.id)}
                  style={{
                    borderColor: on ? c.color : undefined,
                    background: on ? `${c.color}26` : undefined,
                    color: on ? 'var(--color-text)' : undefined,
                  }}
                >
                  <span className="chip-dot" style={{ background: c.color }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="place-list">
          {visiblePois.map((poi) => (
            <button key={poi.name} className="place-item" onClick={() => selectPlace(poi)}>
              <span className="chip-dot" style={{ background: colorOf(poi.cat), marginTop: 6 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="place-head">
                  <span className="place-name">{poi.name}</span>
                  <span className="place-walk">{poi.walk} min</span>
                </span>
                <span className="place-blurb" style={{ display: 'block' }}>{poi.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="map-canvas">
        <div ref={mapEl} className="map-target" />
        <div className="map-address">
          <div className="addr-name">
            <span className="addr-dot" />
            Birken Lofts
          </div>
          401 W. Ontario Street
          <br />
          Chicago, IL 60654
        </div>
        <button type="button" className="map-reset" onClick={showAllLocations}>
          View all locations
        </button>
      </div>
    </div>
  );
}
