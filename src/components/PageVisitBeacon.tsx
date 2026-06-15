import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function sendVisit(path: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const payload = JSON.stringify({
    path,
    title: document.title,
    referrer: document.referrer,
  });
  const blob = new Blob([payload], { type: "application/json" });
  if (navigator.sendBeacon && navigator.sendBeacon("/api/track/page-visit", blob)) {
    return;
  }
  fetch("/api/track/page-visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Page visit alerts must not affect rendering or navigation.
  });
}

export function PageVisitBeacon() {
  const location = useLocation();
  const lastPathRef = useRef("");
  const path = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;
    sendVisit(path);
  }, [path]);

  return null;
}
