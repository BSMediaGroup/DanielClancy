import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import dcDesignStudioLogo from "../../assets/logos/company-dcdesignstudio.svg";

const sydneyCbd: [number, number] = [-33.8688, 151.2093];

export function ContactMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<{
    remove: () => void;
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initialiseMap() {
      if (!mapElementRef.current || mapInstanceRef.current) {
        return;
      }

      const leaflet = await import("leaflet");

      if (isCancelled || !mapElementRef.current) {
        return;
      }

      const map = leaflet.map(mapElementRef.current, {
        center: sydneyCbd,
        zoom: 13,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      leaflet.control
        .zoom({
          position: "topright",
        })
        .addTo(map);

      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        })
        .addTo(map);

      const marker = leaflet.marker(sydneyCbd, {
        icon: leaflet.divIcon({
          className: "contact-map__marker-shell",
          html: `<span class="contact-map__marker"><img alt="" src="${dcDesignStudioLogo}" /></span>`,
          iconSize: [60, 60],
          iconAnchor: [30, 48],
        }),
      });

      marker
        .addTo(map)
        .bindTooltip("<strong>Daniel Clancy</strong><span>Sydney CBD, Australia</span>", {
          direction: "top",
          offset: [0, -26],
          className: "contact-map__tooltip",
          opacity: 1,
        });

      marker.on("mouseover", () => marker.openTooltip());
      marker.on("mouseout", () => marker.closeTooltip());

      mapInstanceRef.current = map;
    }

    void initialiseMap();

    return () => {
      isCancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="contact-map">
      <div className="contact-map__canvas" ref={mapElementRef} />
    </div>
  );
}
