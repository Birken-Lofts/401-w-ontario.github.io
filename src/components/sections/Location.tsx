import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { categories, pois, HOME, type Poi } from '../../data/location';
import { Eyebrow } from '../ui/SectionHeading';

const proximity = [
  { time: '3 min', place: 'Chicago & Franklin CTA' },
  { time: '5 min', place: 'Chicago Riverwalk' },
  { time: '8 min', place: 'Magnificent Mile' },
  { time: '10 min', place: 'The Loop' },
];

const colorOf = (catId: string) => categories.find((c) => c.id === catId)?.color ?? '#bf5e34';

const allOn = () => Object.fromEntries(categories.map((c) => [c.id, true]));

export default function Location() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ poi: Poi; marker: L.Marker }[]>([]);
  const [active, setActive] = useState<Record<string, boolean>>(allOn);

  // Initialize the map once (cleaned up fully so StrictMode's double-mount is safe).
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
        `<b style="font-family:'Instrument Serif';font-size:18px;color:#f4efe7">Birken Lofts</b><br><span style="color:#b3a795;font-size:12px">401 W. Ontario Street · River North</span>`,
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
        `<b style="font-size:14px;color:#f4efe7">${poi.name}</b><br><span style="color:${color};font:600 11px 'Space Grotesk';letter-spacing:.08em;text-transform:uppercase">${poi.walk} min walk</span><br><span style="color:#b3a795;font-size:12px">${poi.blurb}</span>`,
      );
      return { poi, marker };
    });

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

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

  return (
    <section id="location" className="bg-charcoal text-paper pt-[clamp(80px,11vw,150px)]">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)]">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-[18px]">
          <div>
            <Eyebrow className="mb-5">The neighborhood</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(40px,5.5vw,72px)] leading-none text-cream">
              The heart of River North
            </h2>
          </div>
          <p className="m-0 max-w-[400px] font-body text-[15px] leading-[1.7] text-sand-2">
            Step out the door into Chicago&rsquo;s gallery district — world-class dining, transit, the
            Riverwalk, and the Mag Mile, all within a short walk of 401 W. Ontario.
          </p>
        </div>
      </div>

      {/* Map + panel */}
      <div className="max-w-[1500px] mx-auto mt-[34px] px-[clamp(12px,3vw,40px)]">
        <div className="grid grid-cols-1 min-[920px]:grid-cols-[350px_1fr] border border-line-dark rounded-[4px] overflow-hidden bg-charcoal-deep">
          {/* Panel */}
          <div className="flex flex-col bg-panel border-b min-[920px]:border-b-0 min-[920px]:border-r border-line-dark">
            <div className="px-6 pt-[22px] pb-4 border-b border-line-dark">
              <div className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-taupe mb-[6px]">
                Explore by
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActive(allOn())}
                  className="inline-flex items-center cursor-pointer border border-[#5a4d3f] bg-transparent text-sand font-body text-xs font-semibold tracking-[0.04em] px-3 py-2 rounded-[2px]"
                >
                  All
                </button>
                {categories.map((c) => {
                  const on = active[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(c.id)}
                      className="inline-flex items-center gap-2 cursor-pointer font-body text-xs font-medium tracking-[0.02em] px-3 py-2 rounded-[2px] border transition-all"
                      style={{
                        borderColor: on ? c.color : '#3a322b',
                        background: on ? `${c.color}22` : 'transparent',
                        color: on ? '#f4efe7' : '#9a8e7e',
                      }}
                    >
                      <span
                        className="w-[9px] h-[9px] rounded-full flex-none"
                        style={{ background: c.color }}
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bk-place-list overflow-y-auto max-h-[430px] py-[6px]">
              {visiblePois.map((poi) => (
                <button
                  key={poi.name}
                  onClick={() => selectPlace(poi)}
                  className="w-full text-left flex gap-3 items-start px-6 py-[13px] cursor-pointer border-b border-[#241f1a] hover:bg-white/[0.03] transition-colors"
                >
                  <span
                    className="w-[9px] h-[9px] rounded-full flex-none mt-[6px]"
                    style={{ background: colorOf(poi.cat) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-[10px]">
                      <span className="font-body text-sm font-medium text-paper">{poi.name}</span>
                      <span className="font-body text-[11px] font-semibold tracking-[0.04em] text-terracotta whitespace-nowrap">
                        {poi.walk} min
                      </span>
                    </div>
                    <div className="font-body text-xs leading-[1.45] text-taupe-2 mt-[3px]">
                      {poi.blurb}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="relative min-h-[520px]">
            <div ref={mapEl} className="absolute inset-0" />
            <div className="absolute left-[18px] top-[18px] z-[600] bg-charcoal/80 backdrop-blur-[8px] border border-[#3a322b] rounded-[3px] px-4 py-[14px] max-w-[230px] pointer-events-none">
              <div className="flex items-center gap-[9px] mb-[6px]">
                <span className="w-[11px] h-[11px] rounded-full bg-terracotta border-2 border-paper flex-none" />
                <span className="font-body text-[13px] font-semibold text-paper">Birken Lofts</span>
              </div>
              <div className="font-body text-xs leading-[1.5] text-sand-2">
                401 W. Ontario Street
                <br />
                Chicago, IL 60654
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proximity strip */}
      <div className="max-w-[1500px] mx-auto px-[clamp(12px,3vw,40px)] pt-[clamp(40px,6vw,70px)] pb-[clamp(80px,11vw,150px)]">
        <div className="grid grid-cols-2 min-[760px]:grid-cols-4 gap-px bg-line-dark border border-line-dark">
          {proximity.map((p) => (
            <div key={p.place} className="bg-charcoal px-6 py-[22px]">
              <div className="font-display text-[30px] leading-none text-terracotta">{p.time}</div>
              <div className="font-body text-[13px] font-medium text-sand mt-[7px]">{p.place}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
