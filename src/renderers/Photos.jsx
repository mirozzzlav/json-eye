import { identity } from "../i18n.js";
import { style as s } from "../jsonStyles.js";

/** Render a wrapping collection of images with consistent spacing. */
export default function Photos({ items = [], t = identity, className }) {
  if (!Array.isArray(items)) return null;
  const photos = items.filter(
    (photo) => photo && typeof photo.src === "string" && photo.src.trim(),
  );
  if (!photos.length) return null;
  return (
    <span css={s.photoList} data-json-photos="">
      {photos.map((photo, index) => (
        <img
          key={index}
          src={photo.src}
          alt={t(photo.alt ?? "")}
          css={[s.photo, photo.square !== false && s.photoSquare]}
          className={className}
        />
      ))}
    </span>
  );
}
