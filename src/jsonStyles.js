/** Scoped renderer styles; no application globals or CV layout. */
const screenOnly = {
  "@media print": { display: "none" },
};

export const style = {
  link: {
    color: "var(--json-color-text, #000000)",
    fontWeight: 700,
    textDecoration: "none",
  },
  sectionIcon: {
    boxSizing: "border-box",
    width: "40px",
    height: "40px",
    padding: "8px",
    borderRadius: "8px",
    background: "var(--json-color-accent, #49a1f7)",
    color: "var(--json-color-background, #ffffff)",
    objectFit: "contain",
    flexShrink: 0,
    "@media print": {
      width: "32px",
      height: "32px",
      padding: "6px",
    },
  },
  container: {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: 'var(--json-font-family, "Courier New", Courier, monospace)',
    fontSize: "16px",
    lineHeight: "19px",
    fontWeight: 400,
    color: "var(--json-color-text, #000000)",
  },
  collapseToggle: {
    ...screenOnly,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    padding: 0,
    marginRight: "12px",
    marginTop: 0,
    marginBottom: "6px",
    border: "2px solid var(--json-color-accent, #49a1f7)",
    borderRadius: "3px",
    background: "var(--json-color-background, #ffffff)",
    color: "var(--json-color-accent, #49a1f7)",
    cursor: "pointer",
    verticalAlign: "top",
    flexShrink: 0,
    "&:hover": {
      background:
        "color-mix(in srgb, var(--json-color-accent, #49a1f7) 12%, var(--json-color-background, #ffffff))",
    },
    "&:focus-visible": {
      outline: "2px solid var(--json-color-accent, #49a1f7)",
      outlineOffset: "3px",
    },
  },
  collapseIcon: {
    "&::before": {
      content: '"+"',
      fontSize: "20px",
      fontWeight: 700,
      lineHeight: 1,
    },
    '[aria-expanded="true"] &::before': { content: '"−"' },
  },
  collapsedContent: {
    "@media screen": { display: "none" },
  },
  collapsedSummary: {
    ...screenOnly,
    "&::before": { content: '" … "' },
  },
  section: {
    marginTop: "24px",
    marginBottom: "50px",
    "@media screen and (max-width: 600px)": {
      background: "none",
    },
    "@media print": {
      marginTop: "6px",
      marginBottom: "24px",
      breakInside: "avoid",
      pageBreakInside: "avoid",
    },
  },
  jsonObject: {
    display: "block",
    fontFamily: "inherit",
    fontSize: "18px",
    lineHeight: "22px",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    "@media print": {
      fontSize: "14px",
      lineHeight: "var(--json-print-line-height, 18px)",
    },
  },
  jsonProperty: {
    display: "block",
    marginLeft: "24px",
    marginBottom: "10px",
    "@media print": {
      marginBottom: "var(--json-property-gap, 3px)",
    },
  },
  jsonInlineValue: {
    display: "inline-block",
    width: "max-content",
    maxWidth: "100%",
    whiteSpace: "normal",
    verticalAlign: "top",
  },
  jsonArrayValues: {
    display: "block",
    marginLeft: "24px",
    marginTop: "var(--json-array-gap, 6px)",
    marginBottom: "var(--json-array-gap, 6px)",
  },
  jsonLongValue: {
    display: "block",
    width: "auto",
    marginTop: "var(--json-array-gap, 6px)",
    marginBottom: "var(--json-array-gap, 6px)",
  },
  jsonItem: {
    marginBottom: "var(--json-item-gap, 20px)",
    "@media print": {
      marginBottom: "var(--json-item-gap, 12px)",
      breakInside: "avoid",
    },
  },
  jsonKey: {
    color: "var(--json-color-accent, #49a1f7)",
    fontWeight: 700,
  },
  strongHl: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "28px",
    lineHeight: "34px",
    fontWeight: 800,
    textTransform: "uppercase",
    margin: "0 0 20px 0",
    padding: 0,
    breakAfter: "avoid",
    "&::after": {
      content: '""',
      flex: 1,
      borderBottom: "2px solid var(--json-color-accent, #49a1f7)",
    },
    "@media print": {
      fontSize: "22px",
      lineHeight: "28px",
      marginBottom: "20px",
    },
  },
};
