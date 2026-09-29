"use client";

import { useEffect } from "react";
import { INK, OFFSETS, TRUE, type Plate } from "@/lib/printPlates";

// Ported from the mockup's print-plates.js press driver. Hovering a
// `.cmyk .print` figure eases its plates into register while purifying the
// inks, and the pointer leans the moving plates a breath toward the cursor.
// It also publishes --press-nx / --press-ny (-1..1) for the text plates.
// Stands down entirely for reduced motion or without a fine hover pointer;
// the CSS keeps a plain :hover fallback for those cases.
const LEAN_PX: [number, number] = [2.5, 2];
const REGISTER_MS = 450;
const SMOOTHING = 0.22;
const ease = (t: number) => 1 - Math.pow(1 - t, 3); // cubic out

export default function PressDriver() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const svg = document.getElementById("broadsheet-print-plates");
    if (!svg) return;

    const offsets = {} as Record<string, Element>;
    svg.querySelectorAll<SVGElement>("feOffset[data-plate]").forEach((n) => {
      offsets[n.dataset.plate!] = n;
    });
    const mats = {} as Record<string, Element>;
    svg.querySelectorAll<SVGElement>("feColorMatrix[data-plate-mat]").forEach((n) => {
      mats[n.dataset.plateMat!] = n;
    });

    const root = document.documentElement;
    let nx = 0,
      ny = 0; // smoothed pointer, -1..1 from viewport center
    let tx = 0,
      ty = 0; // raw pointer target
    let reg = 1; // 1 = misregistered (rest), 0 = in register
    let regFrom = 1,
      regTo = 1,
      regT0 = 0;
    let raf = 0;
    let lastOffs = "",
      lastReg = -1,
      lastProps = "";

    const tick = (now: number) => {
      raf = 0;
      nx += (tx - nx) * SMOOTHING;
      ny += (ty - ny) * SMOOTHING;
      if (regTo !== reg || regT0) {
        const t = Math.min(1, (now - regT0) / REGISTER_MS);
        reg = regFrom + (regTo - regFrom) * ease(t);
        if (t >= 1) {
          reg = regTo;
          regT0 = 0;
        }
      }
      // Guard every write on its computed output: an equal-value
      // setAttribute still dirties the filter.
      const lx = LEAN_PX[0] * nx,
        ly = LEAN_PX[1] * ny;
      const vals: Record<string, [string, string]> = {};
      let offsKey = "";
      for (const p of Object.keys(OFFSETS) as (keyof typeof OFFSETS)[]) {
        const dx = ((OFFSETS[p][0] + lx) * reg).toFixed(2);
        const dy = ((OFFSETS[p][1] + ly) * reg).toFixed(2);
        vals[p] = [dx, dy];
        offsKey += `${dx},${dy};`;
      }
      if (offsKey !== lastOffs) {
        lastOffs = offsKey;
        for (const p in vals) {
          offsets[p]?.setAttribute("dx", vals[p][0]);
          offsets[p]?.setAttribute("dy", vals[p][1]);
        }
      }
      if (reg !== lastReg) {
        lastReg = reg;
        for (const p of Object.keys(mats) as Plate[]) {
          const a = INK[p],
            b = TRUE[p];
          const v = a.map((ai, i) => (b[i] + (ai - b[i]) * reg).toFixed(3));
          mats[p].setAttribute("values", v.join(" "));
        }
      }
      const pk = `${nx.toFixed(3)},${ny.toFixed(3)}`;
      if (pk !== lastProps) {
        lastProps = pk;
        root.style.setProperty("--press-nx", nx.toFixed(3));
        root.style.setProperty("--press-ny", ny.toFixed(3));
      }
      if (regT0 || Math.abs(tx - nx) > 0.002 || Math.abs(ty - ny) > 0.002) schedule();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const retarget = (to: number) => {
      regFrom = reg;
      regTo = to;
      regT0 = performance.now();
      schedule();
    };
    const printOf = (t: EventTarget | null) =>
      t instanceof Element ? t.closest(".cmyk .print") : null;

    const onMove = (e: PointerEvent) => {
      tx = (2 * e.clientX) / innerWidth - 1;
      ty = (2 * e.clientY) / innerHeight - 1;
      schedule();
    };
    const onOver = (e: PointerEvent) => {
      const p = printOf(e.target);
      if (p && !(e.relatedTarget instanceof Node && p.contains(e.relatedTarget))) retarget(0);
    };
    const onOut = (e: PointerEvent) => {
      const p = printOf(e.target);
      if (p && !(e.relatedTarget instanceof Node && p.contains(e.relatedTarget))) retarget(1);
    };

    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    return () => {
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--press-nx");
      root.style.removeProperty("--press-ny");
    };
  }, []);

  return null;
}
