import { INK, OFFSETS, matrix } from "@/lib/printPlates";

/**
 * The Broadsheet separation filters, rendered once in the root layout so
 * `filter: url(#sep-*)` resolves anywhere in the document. `#sep-all` is the
 * compound four-plate filter used by <PressFigure>; PressDriver animates its
 * feOffset (data-plate) and feColorMatrix (data-plate-mat) nodes.
 */
export default function PrintPlates() {
  return (
    <svg
      id="broadsheet-print-plates"
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="sep-c" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrix(INK.c)} />
        </filter>
        <filter id="sep-m" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrix(INK.m)} />
        </filter>
        <filter id="sep-y" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrix(INK.y)} />
        </filter>
        <filter id="sep-k" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrix(INK.k)} />
        </filter>
        <filter id="sep-all" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values={matrix(INK.c)}
            data-plate-mat="c"
            result="c0"
          />
          <feComposite in="c0" in2="SourceAlpha" operator="in" result="c" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values={matrix(INK.m)}
            data-plate-mat="m"
            result="m0"
          />
          <feComposite in="m0" in2="SourceAlpha" operator="in" result="m1" />
          <feOffset in="m1" dx={OFFSETS.m[0]} dy={OFFSETS.m[1]} data-plate="m" result="m" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values={matrix(INK.y)}
            data-plate-mat="y"
            result="y0"
          />
          <feComposite in="y0" in2="SourceAlpha" operator="in" result="y1" />
          <feOffset in="y1" dx={OFFSETS.y[0]} dy={OFFSETS.y[1]} data-plate="y" result="y" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values={matrix(INK.k)}
            data-plate-mat="k"
            result="k0"
          />
          <feComposite in="k0" in2="SourceAlpha" operator="in" result="k1" />
          <feOffset in="k1" dx={OFFSETS.k[0]} dy={OFFSETS.k[1]} data-plate="k" result="k" />
          <feBlend in="m" in2="c" mode="multiply" result="s1" />
          <feBlend in="y" in2="s1" mode="multiply" result="s2" />
          <feBlend in="k" in2="s2" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}
