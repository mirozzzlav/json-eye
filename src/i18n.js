export const identity = (value) => value;

/** A translator independent of the CV's dictionaries. */
export function createTranslator(lang = "en", dictionaries = {}) {
  const localized = Object.hasOwn(dictionaries, lang) ? dictionaries[lang] : {};
  const english = Object.hasOwn(dictionaries, "en") ? dictionaries.en : {};
  return (token) =>
    (Object.hasOwn(localized, token) ? localized[token] : undefined) ??
    (Object.hasOwn(english, token) ? english[token] : undefined) ??
    token;
}
