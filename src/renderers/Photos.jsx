import { identity } from "../i18n.js";

/** Render a collection of images without adding a DOM wrapper. */
export default function Photos({ items = [], t = identity, className }) {
  if (!Array.isArray(items)) return null;
  return (
    <>
      {items.map((photo, index) =>
        photo && typeof photo.src === "string" && photo.src.trim() ? (
          <img
            key={index}
            src={photo.src}
            alt={t(photo.alt ?? "")}
            className={className}
          />
        ) : null,
      )}
    </>
  );
}
