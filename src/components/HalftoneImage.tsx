import Image from "next/image";

// An image under the halftone dot screen, sized by its container's aspect
// ratio. Until a real image exists (src undefined) it renders a neutral
// placeholder panel with a label, so layouts can be reviewed before content.
export default function HalftoneImage({
  src,
  alt,
  placeholder,
  sizes,
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  placeholder: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`halftone m-0 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          className="flex size-full items-center justify-center border border-dashed border-ink/25 bg-neutral-200 p-4 text-center text-[13px] text-ink/55"
          role="img"
          aria-label={alt || placeholder}
        >
          <span aria-hidden="true">{placeholder}</span>
        </div>
      )}
    </figure>
  );
}
