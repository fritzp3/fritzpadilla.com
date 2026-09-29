import Image from "next/image";

// A hero image printed as four misregistered process plates (the .cmyk .print
// treatment, filtered by #sep-all from <PrintPlates />). Hovering eases the
// plates into register (PressDriver). overflow-visible lets the offset plates
// overhang the frame edge, as in the mockup.
export default function PressFigure({
  src,
  alt,
  placeholder,
  className = "",
}: {
  src?: string;
  alt: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <figure className={`cmyk m-0 overflow-visible ${className}`}>
      <div className="print aspect-[16/10]">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1200px) 1056px, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={alt || placeholder}
            className="flex size-full items-center justify-center border border-dashed border-ink/25 bg-neutral-200 p-4 text-center text-[13px] text-ink/55"
          >
            <span aria-hidden="true">{placeholder}</span>
          </div>
        )}
      </div>
    </figure>
  );
}
