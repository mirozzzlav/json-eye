import { useState } from "react";
import { Global } from "@emotion/react";
import JsonEye, { createTranslator, Photos } from "../src/index.js";
import { data, sections, dictionaries } from "./data.js";
import { globalStyles, styles } from "./styles.js";

export function FramedPhotos(props) {
  return <Photos {...props} css={styles.photo} />;
}

const framedRenderers = { photos: FramedPhotos };

export default function Demo() {
  const [language, setLanguage] = useState("en");
  const [dark, setDark] = useState(false);
  const [withSections, setWithSections] = useState(true);
  const [framed, setFramed] = useState(false);

  return (
    <div css={styles.page} data-theme={dark ? "dark" : "light"}>
      <Global styles={globalStyles} />
      <main css={styles.main}>
        <header>
          <p css={styles.eyebrow}>Standalone React component</p>
          <h1 css={styles.title}>JsonEye</h1>
          <p>Ordinary JSON, presented as a document. Try translations, section headings,
            inline links and photos. Use the + / − buttons to explore nested content.</p>
          <a href="https://github.com/mirozzzlav/json-eye">Source code & documentation ↗</a>
        </header>

        <fieldset css={styles.controls}>
          <legend>Demo options</legend>
          <label>Content language{" "}
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="sk">Slovak</option>
            </select>
          </label>
          <label><input type="checkbox" checked={withSections} onChange={(event) => setWithSections(event.target.checked)} /> Section headings</label>
          <label><input type="checkbox" checked={framed} onChange={(event) => setFramed(event.target.checked)} /> Custom photo renderer</label>
          <label><input type="checkbox" checked={dark} onChange={(event) => setDark(event.target.checked)} /> Dark theme</label>
        </fieldset>

        <section css={styles.preview} aria-label="Rendered document" lang={language}>
          <JsonEye
            key={withSections ? "sections" : "plain"}
            data={data}
            sections={withSections ? sections : undefined}
            t={createTranslator(language, dictionaries)}
            renderers={framed ? framedRenderers : undefined}
          />
        </section>

        <details css={styles.source}>
          <summary>View input JSON and section metadata</summary>
          <h2>data</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <h2>sections {withSections ? "(enabled)" : "(disabled)"}</h2>
          <pre>{JSON.stringify(sections, null, 2)}</pre>
          <p>Translations and renderer overrides are supplied separately from the data.</p>
        </details>
      </main>
    </div>
  );
}
