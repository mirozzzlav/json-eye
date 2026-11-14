import DocumentSection from "../DocumentSection.jsx";
import { identity } from "../i18n.js";
import Icon from "./Icon.jsx";
import { style as s } from "../jsonStyles.js";

/** Generic section; the optional icon is a direct image path. */
export default function Section({
  title = "Section",
  icon,
  background,
  children,
  t = identity,
  className,
}) {
  return (
    <DocumentSection
      className={className}
      background={background}
      title={
        <>
          <Icon src={icon} css={s.sectionIcon} />
          {t(title)}
        </>
      }
    >
      {children}
    </DocumentSection>
  );
}
