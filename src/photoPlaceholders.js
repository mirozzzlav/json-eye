/** A small data parser for photo arrays, with JSON strings or unquoted keys/values. */
export function parsePhotoList(source) {
  let index = 0;
  const whitespace = () => {
    while (/\s/.test(source[index] ?? "") && index < source.length) index++;
  };
  const take = (char) => {
    whitespace();
    if (source[index] !== char) throw new Error("Invalid photo list");
    index++;
  };
  const string = () => {
    const start = index++;
    while (index < source.length) {
      if (source[index] === "\\") {
        index += 2;
        continue;
      }
      if (source[index++] === '"')
        return JSON.parse(source.slice(start, index));
    }
    throw new Error("Unterminated string");
  };
  const key = () => {
    whitespace();
    if (source[index] === '"') return string();
    const match = /^[A-Za-z_$][\w$]*/.exec(source.slice(index));
    if (!match) throw new Error("Invalid key");
    index += match[0].length;
    return match[0];
  };
  const value = () => {
    whitespace();
    if (source[index] === '"') return string();
    const start = index;
    while (index < source.length && !/[,}\]]/.test(source[index])) index++;
    const text = source.slice(start, index).trim();
    if (!text || /["'[{]/.test(text)) throw new Error("Invalid value");
    if (/^(?:null|true|false|-?\d+(?:\.\d+)?)$/.test(text))
      return JSON.parse(text);
    return text;
  };
  try {
    take("[");
    const items = [];
    whitespace();
    while (source[index] !== "]") {
      take("{");
      const photo = Object.create(null);
      whitespace();
      while (source[index] !== "}") {
        const name = key();
        if (!["src", "alt"].includes(name) || Object.hasOwn(photo, name))
          return null;
        take(":");
        photo[name] = value();
        whitespace();
        if (source[index] === "}") break;
        take(",");
        whitespace();
      }
      take("}");
      if (typeof photo.src !== "string" || !photo.src.trim()) return null;
      if (Object.hasOwn(photo, "alt") && typeof photo.alt !== "string")
        return null;
      items.push(photo);
      whitespace();
      if (source[index] === "]") break;
      take(",");
      whitespace();
    }
    take("]");
    whitespace();
    return index === source.length ? items : null;
  } catch {
    return null;
  }
}

/** Find the closing bracket, ignoring delimiters inside quoted JSON strings. */
export function photoListEnd(text, start) {
  let depth = 0;
  let quoted = false;
  for (let index = start; index < text.length; index++) {
    const char = text[index];
    if (quoted && char === "\\") {
      index++;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (char === "[") depth++;
    if (char === "]" && --depth === 0)
      return text[index + 1] === "%" ? index + 2 : -1;
  }
  return -1;
}
