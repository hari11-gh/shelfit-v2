import React, { useEffect } from "react";

export default function MeteorGenerator() {
  useEffect(() => {
    const container = document.querySelector(".meteor-layer");

    function spawnMeteor() {
      if (!container) return;

      const meteor = document.createElement("div");
      meteor.classList.add("meteor");

      // random start position
      meteor.style.left = Math.random() * window.innerWidth + "px";
      meteor.style.top = -100 + "px";

      container.appendChild(meteor);

      // remove after animation
      setTimeout(() => meteor.remove(), 1500);
    }

    // every 4–9 seconds
    const interval = setInterval(() => {
      spawnMeteor();
    }, 4000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  return <div className="meteor-layer"></div>;
}
