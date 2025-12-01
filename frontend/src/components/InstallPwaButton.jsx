import React, { useEffect, useState } from "react";

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handler(e) {
      // Prevent automatic mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  async function install() {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  }

  return (
    <button
      onClick={install}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40
                 flex items-center gap-2 px-4 py-2
                 rounded-full bg-violet-600/90 hover:bg-violet-500
                 text-sm shadow-lg shadow-violet-800/60 border border-violet-300/40"
    >
      📲 Install ShelfIt
    </button>
  );
}
