import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function sendVisit(path: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const userAgent = window.navigator.userAgent || "";
  const payload = JSON.stringify({
    path,
    pageUrl: window.location.href,
    title: document.title,
    referrer: document.referrer,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    browser: /Edg\//i.test(userAgent)
      ? "Edge"
      : /Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)
        ? "Chrome"
        : /Firefox\//i.test(userAgent)
          ? "Firefox"
          : /Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)
            ? "Safari"
            : "Other",
    device: /Mobi|Android|iPhone/i.test(userAgent) ? "Mobile" : /iPad|Tablet/i.test(userAgent) ? "Tablet" : "Desktop",
    platform: /Windows/i.test(userAgent)
      ? "Windows"
      : /Mac OS X|Macintosh/i.test(userAgent)
        ? "macOS"
        : /Android/i.test(userAgent)
          ? "Android"
          : /iPhone|iPad/i.test(userAgent)
            ? "iOS"
            : /Linux/i.test(userAgent)
              ? "Linux"
              : "",
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
