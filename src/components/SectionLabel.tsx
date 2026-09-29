// The small uppercase kicker above each section ("About", "Contact", …).
// Pass as="h2" when the label is the section's only heading; the utilities
// override the base heading styles so it looks identical either way.
export default function SectionLabel({
  children,
  as: Tag = "span",
  id,
}: {
  children: React.ReactNode;
  as?: "span" | "h2";
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className="m-0 mb-5 block font-body text-[13px] leading-[1.55] font-normal tracking-[0.08em] text-ink/70 uppercase"
    >
      {children}
    </Tag>
  );
}
