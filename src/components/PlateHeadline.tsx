/**
 * A display headline set as misregistered C/M/Y process plates (.cmyk-head in
 * globals.css). Each line renders once as real text (.paper) plus three
 * aria-hidden plate repeats. With `plates={false}` it renders plain text.
 */
export default function PlateHeadline({
  lines,
  plates = true,
  className,
}: {
  lines: string[];
  plates?: boolean;
  className?: string;
}) {
  return (
    <h1 className={className}>
      {lines.map((line) =>
        plates ? (
          <span key={line} className="cmyk-head block">
            <span className="paper">{line}</span>
            <span className="plate plate-c" aria-hidden="true">
              {line}
            </span>
            <span className="plate plate-m" aria-hidden="true">
              {line}
            </span>
            <span className="plate plate-y" aria-hidden="true">
              {line}
            </span>
          </span>
        ) : (
          <span key={line} className="block">
            {line}
          </span>
        ),
      )}
    </h1>
  );
}
