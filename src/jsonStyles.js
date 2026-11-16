import { defaultTheme } from "./defaultTheme.js";

const screenOnly = {
  "@media print": { display: "none" },
};

// Fallbacks keep standalone exports usable outside a JsonEye document.
const tokens = Object.fromEntries(
  Object.entries(defaultTheme).map(([name, value]) => [
    name,
    `var(${name}, ${value})`,
  ]),
);

export const style = {
  bold: {
    fontWeight: tokens["--font-weight-bold"],
  },
  link: {
    display: "inline-block",
    maxWidth: `min(100%, ${tokens["--content-max-width"]})`,
    verticalAlign: "top",
    overflowWrap: "anywhere",
    color: tokens["--color-text"],
    fontWeight: tokens["--font-weight-bold"],
    textDecoration: "none",
  },
  photoList: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: tokens["--photo-gap"],
    minWidth: 0,
    maxWidth: `min(100%, ${tokens["--content-max-width"]})`,
    verticalAlign: "top",
  },
  photo: {
    width: tokens["--photo-width"],
    maxWidth: "100%",
    height: "auto",
    boxSizing: "border-box",
    borderWidth: tokens["--photo-border-width"],
    borderStyle: tokens["--photo-border-style"],
    borderColor: tokens["--photo-border-color"],
    borderRadius: tokens["--photo-border-radius"],
  },
  photoSquare: {
    aspectRatio: "1 / 1",
    objectFit: "cover",
  },
  sectionIcon: {
    boxSizing: "border-box",
    width: tokens["--icon-size"],
    height: tokens["--icon-size"],
    padding: tokens["--icon-padding"],
    borderRadius: tokens["--icon-radius"],
    background: tokens["--color-accent"],
    color: tokens["--color-background"],
    objectFit: "contain",
    flexShrink: 0,
    "@media print": {
      width: tokens["--print-icon-size"],
      height: tokens["--print-icon-size"],
      padding: tokens["--print-icon-padding"],
    },
  },
  container: {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: tokens["--font-family"],
    fontWeight: tokens["--font-weight-regular"],
    color: tokens["--color-text"],
  },
  collapseToggle: {
    ...screenOnly,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: tokens["--control-size"],
    height: tokens["--control-size"],
    padding: 0,
    marginRight: tokens["--control-gap"],
    marginTop: 0,
    marginBottom: tokens["--control-margin"],
    border: `${tokens["--border-width"]} solid ${tokens["--color-accent"]}`,
    borderRadius: tokens["--control-radius"],
    background: tokens["--color-background"],
    color: tokens["--color-accent"],
    cursor: "pointer",
    verticalAlign: "top",
    flexShrink: 0,
    "&:hover": {
      background: `color-mix(in srgb, ${tokens["--color-accent"]} ${tokens["--hover-accent-weight"]}, ${tokens["--color-background"]})`,
    },
    "&:focus-visible": {
      outline: `${tokens["--border-width"]} solid ${tokens["--color-accent"]}`,
      outlineOffset: tokens["--focus-offset"],
    },
  },
  collapseIcon: {
    display: "block",
    width: tokens["--control-font-size"],
    height: tokens["--control-font-size"],
    maxWidth: "100%",
    maxHeight: "100%",
    flexShrink: 0,
    strokeWidth: tokens["--border-width"],
  },
  collapsedContent: {
    "@media screen": { display: "none" },
  },
  collapsedSummary: {
    ...screenOnly,
    "&::before": { content: '" … "' },
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: tokens["--section-gap"],
    "@media print": {
      gap: tokens["--print-section-gap"],
    },
  },
  section: {
    "@media print": {
      breakInside: "avoid",
      pageBreakInside: "avoid",
    },
  },
  jsonValue: {
    display: "inline-block",
    maxWidth: `min(100%, ${tokens["--content-max-width"]})`,
    verticalAlign: "top",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  jsonObject: {
    display: "block",
    fontSize: tokens["--font-size"],
    lineHeight: tokens["--line-height"],
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    "@media print": {
      fontSize: tokens["--print-font-size"],
      lineHeight: tokens["--print-line-height"],
    },
  },
  jsonProperty: {
    display: "block",
    marginLeft: tokens["--indent"],
    marginBottom: tokens["--property-gap"],
    "@media print": {
      marginBottom: tokens["--print-property-gap"],
    },
  },
  jsonInlineValue: {
    display: "inline-block",
    width: "max-content",
    maxWidth: `min(100%, ${tokens["--content-max-width"]})`,
    whiteSpace: "normal",
    verticalAlign: "top",
  },
  jsonArrayValues: {
    display: "block",
    marginLeft: tokens["--indent"],
    marginTop: tokens["--array-gap"],
    marginBottom: tokens["--array-gap"],
  },
  jsonPhotoValue: {
    marginRight: tokens["--photo-gap"],
  },
  jsonLongValue: {
    display: "block",
    width: "auto",
    marginTop: tokens["--array-gap"],
    marginBottom: tokens["--array-gap"],
  },
  jsonItem: {
    marginBottom: tokens["--item-gap"],
    "@media print": {
      marginBottom: tokens["--print-item-gap"],
      breakInside: "avoid",
    },
  },
  jsonKey: {
    color: tokens["--color-accent"],
    fontWeight: tokens["--font-weight-bold"],
    flexShrink: 0,
  },
  headingWrapper: {
    display: "block",
    "&::after": { content: "none" },
  },
  headingToggle: {
    width: "100%",
    margin: 0,
    border: 0,
    background: "transparent",
    color: "inherit",
    fontFamily: tokens["--font-family"],
    textAlign: "left",
    cursor: "pointer",
    "&:focus-visible": {
      outline: `${tokens["--border-width"]} solid ${tokens["--color-accent"]}`,
      outlineOffset: tokens["--focus-offset"],
    },
    "@media print": { marginBottom: 0 },
  },
  strongHl: {
    display: "flex",
    alignItems: "center",
    gap: tokens["--heading-gap"],
    fontSize: tokens["--heading-font-size"],
    lineHeight: tokens["--heading-line-height"],
    textTransform: tokens["--heading-text-transform"],
    fontWeight: tokens["--font-weight-heading"],
    margin: `0 0 ${tokens["--heading-margin"]} 0`,
    padding: 0,
    breakAfter: "avoid",
    "@media print": {
      fontSize: tokens["--print-heading-font-size"],
      lineHeight: tokens["--print-heading-line-height"],
      marginBottom: tokens["--print-heading-margin"],
    },
  },
};
