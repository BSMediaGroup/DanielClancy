import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __dcTurnstileScriptPromise?: Promise<void>;
  }
}

type TurnstileChallengeProps = {
  actionLabel: string;
  configUrl?: string;
  resetKey?: number;
  onTokenChange: (token: string) => void;
};

function loadTurnstileScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Window unavailable."));
  if (window.turnstile) return Promise.resolve();
  if (!window.__dcTurnstileScriptPromise) {
    window.__dcTurnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-dc-turnstile]");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.dcTurnstile = "true";
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error("Turnstile script failed to load.")), { once: true });
      document.head.appendChild(script);
    });
  }
  return window.__dcTurnstileScriptPromise;
}

export function TurnstileChallenge({
  configUrl = "/api/turnstile/config",
  resetKey = 0,
  onTokenChange,
}: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [message, setMessage] = useState("Loading security check...");

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let cancelled = false;
    onTokenChangeRef.current("");

    async function renderWidget() {
      try {
        const configResponse = await fetch(configUrl, { cache: "no-store", credentials: "include" });
        const config = (await configResponse.json().catch(() => null)) as { siteKey?: string; message?: string } | null;
        const siteKey = String(config?.siteKey || "").trim();
        if (!siteKey) {
          if (!cancelled) setMessage(config?.message || "Turnstile unavailable in static dev.");
          return;
        }
        await loadTurnstileScript();
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetRef.current) return;
        containerRef.current.innerHTML = "";
        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            onTokenChangeRef.current(token);
            setMessage("Security check complete.");
          },
          "expired-callback": () => {
            onTokenChangeRef.current("");
            setMessage("Security check expired. Please try again.");
          },
          "error-callback": () => {
            onTokenChangeRef.current("");
            setMessage("Security check failed. Retry.");
          },
        });
        setMessage("Complete the security check to continue.");
      } catch {
        if (!cancelled) setMessage("Turnstile unavailable in static dev.");
      }
    }

    renderWidget();

    return () => {
      cancelled = true;
      onTokenChangeRef.current("");
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [configUrl]);

  useEffect(() => {
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      onTokenChangeRef.current("");
      setMessage("Complete the security check to continue.");
    }
  }, [resetKey]);

  return (
    <div className="turnstile-box">
      <div className="turnstile-box__widget" ref={containerRef} />
      <p className="turnstile-box__message">{message}</p>
    </div>
  );
}
