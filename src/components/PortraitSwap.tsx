"use client";

import { useEffect, useRef, useState } from "react";
import HalftoneImage from "@/components/HalftoneImage";

type Img = { src?: string; alt: string };

// The About portrait as a one-way toggle: a click (or Enter/Space) swaps it
// for the alternate image, and there is no way back until the page reloads.
// The alternate is preloaded on hover/focus so the swap doesn't flash empty.
export default function PortraitSwap({
  portrait,
  alternate,
  label,
  sizes,
  className = "",
}: {
  portrait: Img;
  alternate: Img & { src: string };
  label: string;
  sizes: string;
  className?: string;
}) {
  const [swapped, setSwapped] = useState(false);
  const after = useRef<HTMLDivElement>(null);

  // The button unmounts on click; hand focus to the new image so keyboard
  // users aren't dropped back at the top of the document.
  useEffect(() => {
    if (swapped) after.current?.focus();
  }, [swapped]);

  const preload = () => {
    new window.Image().src = alternate.src;
  };

  if (swapped) {
    return (
      <div ref={after} tabIndex={-1} className={`${className} outline-none`}>
        <HalftoneImage
          src={alternate.src}
          alt={alternate.alt}
          placeholder="Portrait"
          sizes={sizes}
          className="size-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setSwapped(true)}
      onPointerEnter={preload}
      onFocus={preload}
      className={`${className} block w-full cursor-pointer p-0`}
    >
      <HalftoneImage
        src={portrait.src}
        alt={portrait.alt}
        placeholder="Portrait"
        sizes={sizes}
        className="size-full"
      />
    </button>
  );
}
