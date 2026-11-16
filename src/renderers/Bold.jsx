import { style as s } from "../jsonStyles.js";

export default function Bold({ children, className }) {
  return (
    <strong css={s.bold} className={className}>
      {children}
    </strong>
  );
}
