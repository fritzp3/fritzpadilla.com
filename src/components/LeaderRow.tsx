// A label … value row joined by a dotted leader, like a table of contents.
// Used for the About skills and the case-study metadata. Below `sm` there is
// no room for a leader, so the value stacks under the label instead.
export default function LeaderRow({
  label,
  value,
  labelClassName = "",
  valueClassName = "",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <p className="m-0 flex flex-col text-[15.5px] leading-[28px] max-sm:mb-2 sm:flex-row sm:items-baseline sm:gap-2">
      <span className={labelClassName}>{label}</span>
      <span
        aria-hidden="true"
        className="hidden sm:mb-[0.34em] sm:block sm:min-w-7 sm:flex-1 sm:self-end sm:border-b sm:border-dotted sm:border-ink/45"
      />
      <span className={`max-sm:leading-[1.45] sm:text-right ${valueClassName}`}>{value}</span>
    </p>
  );
}
