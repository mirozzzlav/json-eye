/** Scoped renderer styles; no application globals or CV layout. */
const tokens = {
  color: {
    text: "var(--json-color-text, #000000)",
    background: "var(--json-color-background, #ffffff)",
    accent: "var(--json-color-accent, #49a1f7)",
  },
  spacing: {
    compact: "6px",
    iconPadding: "8px",
    propertyGap: "10px",
    controlGap: "12px",
    headingGap: "16px",
    headingMargin: "20px",
    large: "24px",
    sectionMargin: "50px",
  },
  typography: {
    body: { fontSize: "16px", lineHeight: "19px" },
    json: { fontSize: "18px", lineHeight: "22px" },
    printJson: {
      fontSize: "14px",
      lineHeight: "var(--json-print-line-height, 18px)",
    },
    heading: { fontSize: "28px", lineHeight: "34px" },
    printHeading: { fontSize: "22px", lineHeight: "28px" },
  },
  fontWeight: { regular: 400, bold: 700, heading: 800 },
  size: { photoWidth: "120px" },
  radius: { small: "3px", medium: "8px" },
  borderWidth: "2px",
  arrayGap: "var(--json-array-gap, 6px)",
};

const screenOnly = {
  "@media print": { display: "none" },
};

export const style = {
  link: {
    color: tokens.color.text,
    fontWeight: tokens.fontWeight.bold,
    textDecoration: "none",
  },
  photoList: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: tokens.spacing.compact,
    minWidth: 0,
    maxWidth: "100%",
    verticalAlign: "top",
  },
  photo: {
    width: tokens.size.photoWidth,
    maxWidth: "100%",
    height: "auto",
  },
  photoSquare: {
    aspectRatio: "1 / 1",
    objectFit: "cover",
  },
  sectionIcon: {
    boxSizing: "border-box",
    width: "40px",
    height: "40px",
    padding: tokens.spacing.iconPadding,
    borderRadius: tokens.radius.medium,
    background: tokens.color.accent,
    color: tokens.color.background,
    objectFit: "contain",
    flexShrink: 0,
    "@media print": {
      width: "32px",
      height: "32px",
      padding: tokens.spacing.compact,
    },
  },
  container: {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: 'var(--json-font-family, "Courier New", Courier, monospace)',
    ...tokens.typography.body,
    fontWeight: tokens.fontWeight.regular,
    color: tokens.color.text,
  },
  collapseToggle: {
    ...screenOnly,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    padding: 0,
    marginRight: tokens.spacing.controlGap,
    marginTop: 0,
    marginBottom: tokens.spacing.compact,
    border: `${tokens.borderWidth} solid ${tokens.color.accent}`,
    borderRadius: tokens.radius.small,
    background: tokens.color.background,
    color: tokens.color.accent,
    cursor: "pointer",
    verticalAlign: "top",
    flexShrink: 0,
    "&:hover": {
      background: `color-mix(in srgb, ${tokens.color.accent} 12%, ${tokens.color.background})`,
    },
    "&:focus-visible": {
      outline: `${tokens.borderWidth} solid ${tokens.color.accent}`,
      outlineOffset: "3px",
    },
  },
  collapseIcon: {
    "&::before": {
      content: '"+"',
      fontSize: "20px",
      fontWeight: tokens.fontWeight.bold,
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
    marginTop: tokens.spacing.large,
    marginBottom: tokens.spacing.sectionMargin,
    "@media screen and (max-width: 600px)": {
      background: "none",
    },
    "@media print": {
      marginTop: tokens.spacing.compact,
      marginBottom: tokens.spacing.large,
      breakInside: "avoid",
      pageBreakInside: "avoid",
    },
  },
  jsonObject: {
    display: "block",
    fontFamily: "inherit",
    ...tokens.typography.json,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    "@media print": {
      ...tokens.typography.printJson,
    },
  },
  jsonProperty: {
    display: "block",
    marginLeft: tokens.spacing.large,
    marginBottom: tokens.spacing.propertyGap,
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
    marginLeft: tokens.spacing.large,
    marginTop: tokens.arrayGap,
    marginBottom: tokens.arrayGap,
  },
  jsonPhotoValue: {
    marginRight: tokens.spacing.compact,
  },
  jsonLongValue: {
    display: "block",
    width: "auto",
    marginTop: tokens.arrayGap,
    marginBottom: tokens.arrayGap,
  },
  jsonItem: {
    marginBottom: "var(--json-item-gap, 20px)",
    "@media print": {
      marginBottom: "var(--json-item-gap, 12px)",
      breakInside: "avoid",
    },
  },
  jsonKey: {
    color: tokens.color.accent,
    fontWeight: tokens.fontWeight.bold,
    flexShrink: 0,
  },
  strongHl: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing.headingGap,
    ...tokens.typography.heading,
    fontWeight: tokens.fontWeight.heading,
    textTransform: "uppercase",
    margin: `0 0 ${tokens.spacing.headingMargin} 0`,
    padding: 0,
    breakAfter: "avoid",
    "&::after": {
      content: '""',
      flex: 1,
      borderBottom: `${tokens.borderWidth} solid ${tokens.color.accent}`,
    },
    "@media print": {
      ...tokens.typography.printHeading,
      marginBottom: tokens.spacing.headingMargin,
    },
  },
};
