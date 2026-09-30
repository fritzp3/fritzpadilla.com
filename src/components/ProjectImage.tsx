import Image from "next/image";

// A case study's main project image, shown whole and unfiltered: natural aspect ratio,
// never cropped, and never scaled past its own width (so small images stay
// sharp). Until a real image exists (src undefined) it renders a 16:10
// labelled placeholder panel.
export default function ProjectImage({
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
    <figure className={`m-0 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          priority
          sizes="(min-width: 1200px) 1056px, 100vw"
          className="block h-auto w-auto max-w-full"
        />
      ) : (
        <div
          role="img"
          aria-label={alt || placeholder}
          className="flex aspect-[16/10] items-center justify-center border border-dashed border-ink/25 bg-neutral-200 p-4 text-center text-[13px] text-ink/70"
        >
          <span aria-hidden="true">{placeholder}</span>
        </div>
      )}
    </figure>
  );
}
