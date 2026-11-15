import { useId } from "react";
import { style as s } from "./jsonStyles.js";

export default function DocumentSection({
  title,
  children,
  className,
  expanded,
  onToggle,
  elementRef,
}) {
  const id = useId();

  return (
    <section
      ref={elementRef}
      css={s.section}
      className={className}
      aria-labelledby={id}
    >
      <h3 id={id} css={[s.strongHl, onToggle && s.headingWrapper]}>
        {onToggle ? (
          <button
            type="button"
            css={[s.strongHl, s.headingToggle]}
            aria-expanded={expanded}
            aria-controls={`${id}-content`}
            onClick={onToggle}
          >
            {title}
          </button>
        ) : (
          title
        )}
      </h3>
      <div id={`${id}-content`} css={s.jsonObject}>{children}</div>
    </section>
  );
}
