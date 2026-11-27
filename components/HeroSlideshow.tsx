"use client";

import { useEffect, useState } from "react";

// Homepage hero background: a real creator at work for each kind of creator, crossfading every few seconds.
// Photos from Unsplash (Unsplash License): Gonzalo Poblete (music), Jakob Owens (travel),
// Vitaly Gariev (food, fitness), I'M ZION (tech), Detail .co (vlog), Fausto Sandoval (gaming).
const SLIDES = [
  { src: "/img/hero-vlog.jpg", label: "vloggers", pos: "50% 40%" },
  { src: "/img/hero-food.jpg", label: "food creators", pos: "35% 40%" },
  { src: "/img/hero-travel.jpg", label: "travellers", pos: "50% 50%" },
  { src: "/img/hero-tech.jpg", label: "tech reviewers", pos: "50% 45%" },
  { src: "/img/hero-fitness.jpg", label: "fitness creators", pos: "50% 50%" },
  { src: "/img/hero-gaming.jpg", label: "gamers", pos: "50% 22%" },
  { src: "/img/hero-music.jpg", label: "musicians", pos: "50% 35%" },
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
          <img
            key={s.src}
            src={s.src}
            alt=""
            className={i === active ? "on" : ""}
            style={{ objectPosition: s.pos }}
            loading={i < 2 ? "eager" : "lazy"}
          />
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
