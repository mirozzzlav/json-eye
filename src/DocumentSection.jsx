import { useId } from "react";
import { style as s } from "./jsonStyles.js";

export default function DocumentSection({
  title,
  children,
  className,
  background,
}) {
  const id = useId();
  const hasBackground = typeof background === "string" && background.length > 0;
  const isImage =
    hasBackground &&
    !/^\s*[\w-]+\(/.test(background) &&
    (/^(?:https?:\/\/|\/|\.\.?\/|data:image\/|blob:)/i.test(background) ||
      /\.(?:svg|png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(background));
  const backgroundStyle = !hasBackground
    ? undefined
    : isImage
      ? {
          backgroundImage: `url(${JSON.stringify(background)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : { background };

  return (
    <section
      css={[s.section, backgroundStyle]}
      className={className}
      aria-labelledby={id}
    >
      <h3 id={id} css={s.strongHl}>
        {title}
      </h3>
      <div css={s.jsonObject}>{children}</div>
    </section>
  );
}
