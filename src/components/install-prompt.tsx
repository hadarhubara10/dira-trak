"use client";

import { useEffect, useState, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sevenDays) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isiOS) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Listen for beforeinstallprompt
    function handler(e: Event) {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      deferredPromptRef.current.userChoice.then(() => {
        setShow(false);
        deferredPromptRef.current = null;
      });
    }
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem("install-prompt-dismissed", Date.now().toString());
  }

  if (!show) return null;

  return (
    <div className="mx-5 mb-3 flex items-center gap-3 rounded-[10px] border border-[#c7d9f7] bg-gradient-to-br from-[#eff4ff] to-[#f0f7ff] p-3.5">
      <span className="shrink-0 text-[28px]">📲</span>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-text-primary">
          התקן את DiraTrak
        </div>
        <div className="mt-px text-[11px] text-text-secondary">
          {isIOS
            ? 'לחץ על כפתור השיתוף ואז "הוסף למסך הבית"'
            : "גישה מהירה מהמסך הראשי"}
        </div>
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-accent-blue px-3.5 py-1.5 text-xs font-semibold text-white"
        >
          התקן
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 text-base text-text-muted"
      >
        ✕
      </button>
    </div>
  );
}
