"use client";

import { useEffect, useState } from "react";

// Homepage hero background: one photo per kind of creator, crossfading every few seconds.
// Photos from Unsplash (Unsplash License): Gonzalo Poblete, Danka & Peter, Webvilla,
// Alejandro Escamilla, Mia Domenico, Pawel Kadysz.
const SLIDES = [
  { src: "/img/hero-music.jpg", label: "musicians" },
  { src: "/img/hero-travel.jpg", label: "travellers" },
  { src: "/img/hero-food.jpg", label: "food creators" },
  { src: "/img/hero-tech.jpg", label: "tech reviewers" },
  { src: "/img/hero-vlog.jpg", label: "vloggers" },
  { src: "/img/hero-gaming.jpg", label: "gamers" },
];
const INTERVAL_MS = 3500;

export default function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="hb-slides" aria-hidden>
        {SLIDES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.src} src={s.src} alt="" className={i === active ? "on" : ""} loading={i < 2 ? "eager" : "lazy"} />
        ))}
      </div>
      <p className="hb-for" aria-live="off">
        Made for{" "}
        <span key={active} className="hb-for-word">
          {SLIDES[active].label}
        </span>
      </p>
    </>
  );
}
