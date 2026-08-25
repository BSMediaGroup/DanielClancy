import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import darkModePin from "../../assets/icons/dcpindarkmode.svg";
import lightModePin from "../../assets/icons/dcpinlightmode.svg";
import type { ProfessionalOutletContext, ProfessionalTheme } from "./ProfessionalShell";

const sydneyCbd: [number, number] = [151.2093, -33.8688];
const mapAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function mapStyleConfig(theme: ProfessionalTheme): StyleSpecification {
  const sourceId = `contact-carto-${theme}`;
  const tileTheme = theme === "dark" ? "dark_all" : "light_all";

  return {
    version: 8,
    sources: {
      [sourceId]: {
        type: "raster",
        tiles: [`https://a.basemaps.cartocdn.com/${tileTheme}/{z}/{x}/{y}.png`],
        tileSize: 256,
        maxzoom: 20,
        attribution: mapAttribution,
      },
    },
    layers: [
      {
        id: sourceId,
        type: "raster",
        source: sourceId,
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  };
}

function pinForTheme(theme: ProfessionalTheme) {
  return theme === "dark" ? darkModePin : lightModePin;
}

type MapStatus = "loading" | "ready" | "error";

export function ContactMap() {
  const { theme } = useOutletContext<ProfessionalOutletContext>();
  const [status, setStatus] = useState<MapStatus>("loading");
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markerImageRef = useRef<HTMLImageElement | null>(null);
  const themeRef = useRef(theme);

  themeRef.current = theme;

  useEffect(() => {
    let isCancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function initialiseMap() {
      if (!mapElementRef.current || mapInstanceRef.current) {
        return;
      }

      try {
        const maplibregl = await import("maplibre-gl");

        if (isCancelled || !mapElementRef.current) {
          return;
        }

        const map = new maplibregl.Map({
          container: mapElementRef.current,
          style: mapStyleConfig(themeRef.current),
          center: sydneyCbd,
          zoom: 12.7,
          minZoom: 3,
          maxZoom: 20,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          scrollZoom: false,
        });

        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();
        map.addControl(
          new maplibregl.NavigationControl({
            showCompass: false,
            visualizePitch: false,
          }),
          "top-right",
        );
        map.addControl(new maplibregl.ScaleControl({ maxWidth: 108, unit: "metric" }), "bottom-left");

        map.getCanvas().setAttribute("aria-label", "Interactive map showing Sydney CBD, Australia");

        const markerElement = document.createElement("button");
        markerElement.type = "button";
        markerElement.className = "contact-map__marker";
        markerElement.setAttribute("aria-label", "Daniel Clancy location: Sydney CBD, Australia");
        markerElement.setAttribute("aria-expanded", "false");
        markerElement.setAttribute("aria-haspopup", "dialog");

        const markerImage = document.createElement("img");
        markerImage.alt = "";
        markerImage.src = pinForTheme(themeRef.current);
        markerElement.append(markerImage);
        markerImageRef.current = markerImage;

        const popupContent = document.createElement("span");
        popupContent.className = "contact-map__popup-content";

        const popupTitle = document.createElement("strong");
        popupTitle.textContent = "Daniel Clancy";
        const popupLocation = document.createElement("span");
        popupLocation.textContent = "Sydney CBD, Australia";
        popupContent.append(popupTitle, popupLocation);

        const popup = new maplibregl.Popup({
          anchor: "bottom",
          offset: [0, -76],
          closeButton: true,
          closeOnClick: false,
          className: "contact-map__popup",
          maxWidth: "15rem",
        })
          .setLngLat(sydneyCbd)
          .setDOMContent(popupContent);

        const openPopup = () => popup.addTo(map);
        const closePopup = () => popup.remove();

        popup.on("open", () => markerElement.setAttribute("aria-expanded", "true"));
        popup.on("close", () => markerElement.setAttribute("aria-expanded", "false"));

        markerElement.addEventListener("pointerenter", openPopup);
        markerElement.addEventListener("pointerleave", closePopup);
        markerElement.addEventListener("focus", openPopup);
        markerElement.addEventListener("blur", closePopup);
        markerElement.addEventListener("click", openPopup);
        markerElement.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            closePopup();
          }
        });

        new maplibregl.Marker({
          element: markerElement,
          anchor: "bottom",
        })
          .setLngLat(sydneyCbd)
          .addTo(map);
        markerElement.setAttribute("aria-label", "Daniel Clancy location: Sydney CBD, Australia");

        map.once("style.load", () => {
          if (!isCancelled) {
            setStatus("ready");
          }
        });

        resizeObserver = new ResizeObserver(() => map.resize());
        resizeObserver.observe(mapElementRef.current);
        mapInstanceRef.current = map;
      } catch {
        if (!isCancelled) {
          setStatus("error");
        }
      }
    }

    void initialiseMap();

    return () => {
      isCancelled = true;
      resizeObserver?.disconnect();
      markerImageRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (markerImageRef.current) {
      markerImageRef.current.src = pinForTheme(theme);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(mapStyleConfig(theme), { diff: true });
    }
  }, [theme]);

  return (
    <div className="contact-map" data-map-status={status}>
      <div className="contact-map__canvas" ref={mapElementRef} />
      {status !== "ready" ? (
        <div className={`contact-map__status contact-map__status--${status}`} role="status" aria-live="polite">
          {status === "error" ? "Interactive map unavailable." : "Loading interactive map…"}
        </div>
      ) : null}
    </div>
  );
}
