/** Section icons are decorative images referenced directly by their path. */
export default function Icon({ src, className }) {
  if (typeof src !== "string" || !src.trim()) return null;
  return <img className={className} src={src} alt="" aria-hidden="true" />;
}
