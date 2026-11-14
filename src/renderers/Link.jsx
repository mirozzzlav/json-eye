import { style as s } from "../jsonStyles.js";

/** Generic web/email link renderer, independent of application styles. */
export default function Link({ url, children, className }) {
  if (typeof url !== "string" || !url.trim()) return children ?? null;
  url = url.trim();
  const hasMailto = /^mailto:/i.test(url);
  const isEmail =
    hasMailto || /^[^\s@/:?#]+@[^\s@/:?#]+\.[^\s@/:?#]+$/.test(url);
  const href = isEmail
    ? hasMailto
      ? url
      : `mailto:${url}`
    : /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

  return (
    <a
      css={s.link}
      className={className}
      href={href}
      target={isEmail ? undefined : "_blank"}
      rel={isEmail ? undefined : "noopener noreferrer"}
    >
      {children ?? url}
    </a>
  );
}
