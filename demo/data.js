const asset = (name) => `${import.meta.env.BASE_URL}${name}`;

const galleryPhotos = Array.from({ length: 4 }, () => [
  { src: asset("landscape.svg"), alt: "Mountain landscape", square: true },
  { src: asset("shapes.svg"), alt: "Abstract shapes", square: true },
]).flat();

for (let index = galleryPhotos.length - 1; index > 0; index--) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [galleryPhotos[index], galleryPhotos[randomIndex]] = [
    galleryPhotos[randomIndex], galleryPhotos[index],
  ];
}

export const data = {
  profile: {
    name: "Jane Doe",
    role: "Frontend developer",
    available: true,
    bio: "intro",
    contact: "%link;url=jane@example.com;text=Email me%",
  },
  skills: {
    languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
    tools: ["React", "Emotion", "Vite"],
    experience: { years: 5, remote: true, nextProject: null },
  },
  gallery: {
    description: "galleryDescription",
    photos: `%photos${JSON.stringify(galleryPhotos)}%`,
  },
  details: {
    note: "detailsNote",
    links: [
      "%link;url=github.com/mirozzzlav/json-eye;text=Source code%",
      "%link;url=npmjs.com/package/react-json-eye;text=npm package%",
    ],
  },
};

export const sections = {
  profile: { title: "Profile", icon: asset("profile.svg") },
  skills: { title: "Skills", icon: asset("code.svg") },
  gallery: { title: "Gallery", icon: asset("image.svg") },
  details: { title: "Details", icon: asset("details.svg") },
};

export const dictionaries = {
  en: {
    intro: "I build interfaces with React, focusing on clear layouts, accessible interactions and reusable components that work well on phones, tablets and larger screens. My projects often bring together structured data, translated content and rich elements such as links and photos in a single document. I enjoy turning complex requirements into interfaces that are easy to read and comfortable to use, even when a description grows beyond a few short sentences. This longer biography shows how text wraps within the available space and how an inline link fits naturally into a paragraph. Find the renderer at %link;url=github.com/mirozzzlav/json-eye;text=GitHub%.",
    galleryDescription: "Local illustrations rendered from an inline photos placeholder.",
    detailsNote: "This section starts collapsed. Open it with the + button; nested objects collapse independently.",
  },
  sk: {
    intro: "Tvorím rozhrania v Reacte so zameraním na prehľadné rozloženie, prístupné ovládanie a opakovane použiteľné komponenty, ktoré fungujú na telefónoch, tabletoch aj väčších obrazovkách. V mojich projektoch sa často spájajú štruktúrované dáta, preložený obsah a prvky ako odkazy či fotografie v jednom dokumente. Baví ma premieňať zložité požiadavky na rozhrania, ktoré sa dobre čítajú a pohodlne používajú, aj keď popis presiahne niekoľko krátkych viet. Tento dlhší životopis ukazuje zalamovanie textu podľa dostupného priestoru aj prirodzené začlenenie odkazu do odseku. Renderer nájdeš na %link;url=github.com/mirozzzlav/json-eye;text=GitHube%.",
    galleryDescription: "Lokálne ilustrácie zobrazené pomocou inline zástupného zápisu photos.",
    detailsNote: "Táto sekcia začína zbalená. Otvor ju tlačidlom +; vnorené objekty sa zbalia samostatne.",
    Profile: "Profil", Skills: "Zručnosti", Gallery: "Galéria", Details: "Podrobnosti",
    name: "meno", role: "pozícia", available: "dostupnosť", bio: "o mne",
    contact: "kontakt", languages: "jazyky", tools: "nástroje", experience: "skúsenosti",
    years: "roky", remote: "na diaľku", nextProject: "ďalší projekt",
    description: "popis", photos: "fotografie", note: "poznámka", links: "odkazy",
    profile: "profil", skills: "zručnosti", gallery: "galéria", details: "podrobnosti",
    "Frontend developer": "Frontend vývojárka", "Email me": "Napíš mi",
    "Source code": "Zdrojový kód", "npm package": "npm balíček",
    "Mountain landscape": "Horská krajina", "Abstract shapes": "Abstraktné tvary",
  },
};
