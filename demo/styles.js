const tokens = {
  space: { small: 8, medium: 16, large: 24, section: 32, page: 64 },
  radius: 12,
  border: "1px solid var(--demo-border)",
};

export const globalStyles = {
    "*": { boxSizing: "border-box" },
    body: { margin: 0, fontFamily: "system-ui, sans-serif", fontSize: 17, lineHeight: 1.6 },
    "button, select, input": { font: "inherit", accentColor: "var(--demo-accent)" },
    "a, summary": { color: "var(--demo-accent)" },
    "a:focus-visible, summary:focus-visible, select:focus-visible, input:focus-visible": {
      outline: "3px solid var(--demo-accent)", outlineOffset: 4,
    },
};

export const styles = {
  page: {
    "--demo-background": "#f4f5f8", "--demo-surface": "#ffffff",
    "--demo-text": "#1b2330", "--demo-muted": "#536176",
    "--demo-border": "#c7cfda", "--demo-accent": "#275ec2",
    '&[data-theme="dark"]': {
      "--demo-background": "#151922", "--demo-surface": "#202735",
      "--demo-text": "#f1f4fa", "--demo-muted": "#b0bdd0",
      "--demo-border": "#536176", "--demo-accent": "#8bbdff",
    },
    "--json-color-text": "var(--demo-text)",
    "--json-color-background": "var(--demo-surface)",
    "--json-color-accent": "var(--demo-accent)",
    minHeight: "100vh", background: "var(--demo-background)", color: "var(--demo-text)",
  },
  main: {
    maxWidth: 1040, margin: "auto", padding: `${tokens.space.section}px ${tokens.space.medium}px`,
    "@media (min-width: 768px)": { padding: `${tokens.space.page}px ${tokens.space.large}px` },
  },
  eyebrow: { marginBottom: 0, color: "var(--demo-muted)" },
  title: { margin: 0, fontSize: "clamp(48px, 10vw, 88px)", letterSpacing: "-0.06em", lineHeight: 1.2 },
  controls: {
    display: "flex", flexWrap: "wrap", alignItems: "center", gap: tokens.space.large,
    minWidth: 0, margin: `${tokens.space.section}px 0`, padding: tokens.space.medium,
    border: tokens.border, borderRadius: tokens.radius,
    label: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: tokens.space.small, cursor: "pointer" },
    input: { width: 18, height: 18 },
    select: { color: "var(--demo-text)", background: "var(--demo-surface)", padding: tokens.space.small, border: tokens.border, borderRadius: 4 },
  },
  preview: {
    minWidth: 0, padding: tokens.space.medium, background: "var(--demo-surface)",
    border: tokens.border, borderRadius: tokens.radius,
    "@media (min-width: 768px)": { padding: tokens.space.section },
    "@media print": { border: 0, padding: 0 },
  },
  photo: {
    width: 240, margin: tokens.space.small, padding: tokens.space.small,
    border: tokens.border, borderRadius: tokens.radius, background: "var(--demo-background)",
  },
  source: {
    marginTop: tokens.space.section, overflowWrap: "anywhere",
    summary: { cursor: "pointer", padding: `${tokens.space.small}px 0` },
    h2: { fontSize: 18 },
    pre: { padding: tokens.space.medium, overflowX: "auto", background: "var(--demo-surface)", border: tokens.border, borderRadius: tokens.radius, fontSize: 14 },
  },
};
