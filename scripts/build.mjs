import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const escape = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
const readCollection = (name) => readdirSync(path.join(root, "data", name)).filter((file) => file.endsWith(".json")).map((file) => JSON.parse(readFileSync(path.join(root, "data", name, file), "utf8")));
const films = readCollection("films").sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
const people = readCollection("people").sort((a, b) => a.name.localeCompare(b.name));
const places = readCollection("places").sort((a, b) => a.name.localeCompare(b.name));
const themes = readCollection("themes").sort((a, b) => a.name.localeCompare(b.name));
const history = readCollection("history").sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
const byId = (items) => new Map(items.map((item) => [item.id, item]));
const peopleMap = byId(people);
const filmsMap = byId(films);
const placesMap = byId(places);
const themesMap = byId(themes);
const historyMap = byId(history);

function layout({ title, description, body, current = "" }) {
  const pageTitle = title ? `${escape(title)} — Filmada` : "Filmada — Malagasy film and audiovisual directory";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageTitle}</title><meta name="description" content="${escape(description)}"><link rel="stylesheet" href="/styles.css">
</head><body><a class="skip" href="#content">Skip to content</a>
<header class="site-header"><nav class="nav shell" aria-label="Main navigation"><a class="brand" href="/"><span></span>Filmada</a><button class="menu" aria-expanded="false" aria-controls="navlinks">Menu</button><div id="navlinks" class="navlinks"><a ${current === "people" ? 'aria-current="page"' : ""} href="/people/">People</a><a ${current === "films" ? 'aria-current="page"' : ""} href="/films/">Films</a><a ${current === "organisations" ? 'aria-current="page"' : ""} href="/organisations/">Organisations</a><a ${current === "opportunities" ? 'aria-current="page"' : ""} href="/opportunities/">Opportunities</a><a ${current === "history" ? 'aria-current="page"' : ""} href="/history/">History</a><a href="/contribute/">Contribute</a></div></nav></header>
<main id="content">${body}</main>
<footer><div class="shell footer"><div><a class="brand" href="/"><span></span>Filmada</a><p>An open, collaborative directory of Madagascar's film and audiovisual field.</p></div><div><a href="/about/">About</a><a href="/contribute/">Contribute</a><a href="https://github.com/mosenjo/filmada">Source on GitHub</a></div></div></footer><script src="/site.js"></script></body></html>`;
}

function write(route, html) {
  const directory = path.join(dist, route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "index.html"), html);
}

const status = '<span class="status">Imported · needs review</span>';
const filmCard = (film) => `<article class="card"><p class="eyebrow">${film.year ?? "Year unknown"}</p><h2><a href="/films/${film.id}/">${escape(film.title)}</a></h2><p>${escape(peopleMap.get(film.primaryDirector)?.name ?? "Credits being documented")}</p></article>`;
const personCard = (person) => `<article class="card"><p class="eyebrow">${escape(person.roles.join(" · ") || "Film professional")}</p><h2><a href="/people/${person.id}/">${escape(person.name)}</a></h2><p>${escape(person.biography.slice(0, 150))}${person.biography.length > 150 ? "…" : ""}</p></article>`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(path.join(root, "public"), dist, { recursive: true });

write("", layout({ description: "Discover the people, films, organisations, opportunities and history of Madagascar's film and audiovisual field.", body: `<section class="hero shell"><p class="kicker">Madagascar · Film · Audiovisual</p><h1>Who makes Malagasy cinema—and how can we help the field grow?</h1><p class="lead">Filmada is an open, collaborative directory documenting the people, works, organisations, opportunities and history shaping Madagascar's film and audiovisual landscape.</p><div class="actions"><a class="button primary" href="/people/">Explore the directory</a><a class="button" href="/contribute/">Contribute knowledge</a></div></section><section class="shell section"><div class="section-head"><div><p class="kicker">Starting point</p><h2>A field made visible</h2></div><p>Filmada begins with ${people.length} people and ${films.length} films migrated from its earlier prototype. Every record is being opened for careful community review.</p></div><div class="metrics"><a href="/people/"><strong>${people.length}</strong><span>People</span></a><a href="/films/"><strong>${films.length}</strong><span>Films</span></a><a href="/organisations/"><strong>Open</strong><span>Organisations to document</span></a><a href="/opportunities/"><strong>Current</strong><span>Opportunities to share</span></a></div></section><section class="band"><div class="shell section"><div class="section-head"><div><p class="kicker">Recently released</p><h2>Films in the directory</h2></div><a href="/films/">View all films →</a></div><div class="grid">${films.slice(0, 6).map(filmCard).join("")}</div></div></section><section class="shell callout"><p class="kicker">Built together</p><h2>Filmada belongs to the people committed to documenting Malagasy cinema.</h2><p>You do not need to know GitHub or write code. Suggest a correction, document someone missing from the directory, or join the editorial group.</p><a class="button primary" href="/contribute/">How to contribute</a></section>` }));

write("people", layout({ title: "People", current: "people", description: "People working across Madagascar's film and audiovisual field.", body: `<header class="page shell"><p class="kicker">Directory</p><h1>People</h1><p class="lead">Filmmakers and audiovisual professionals connected to Madagascar. This initial collection is incomplete by design—and ready to grow.</p></header><section class="shell section"><div class="grid">${people.map(personCard).join("")}</div></section>` }));
write("films", layout({ title: "Films", current: "films", description: "Films and audiovisual works connected to Madagascar.", body: `<header class="page shell"><p class="kicker">Works</p><h1>Films</h1><p class="lead">A growing record of Malagasy films and audiovisual works, their makers, contexts and connections.</p></header><section class="shell section"><div class="grid">${films.map(filmCard).join("")}</div></section>` }));

for (const person of people) {
  const linkedFilms = person.films.map(({ id }) => filmsMap.get(id)).filter(Boolean);
  write(`people/${person.id}`, layout({ title: person.name, current: "people", description: person.biography.slice(0, 155), body: `<article class="detail shell"><a class="back" href="/people/">← All people</a><p class="kicker">${escape(person.roles.join(" · "))}</p><h1>${escape(person.name)}</h1>${status}<div class="prose"><p>${escape(person.biography)}</p></div>${linkedFilms.length ? `<section><h2>Filmography in Filmada</h2><div class="grid">${linkedFilms.map(filmCard).join("")}</div></section>` : ""}<section class="sources"><h2>Source notes</h2>${person.sources.map((source) => `<p>${escape(source.note)}</p>`).join("")}<p class="notice">These imported notes need to be replaced with direct, structured citations.</p></section></article>` }));
}

for (const film of films) {
  const director = peopleMap.get(film.primaryDirector);
  const relatedThemes = film.themes.map((id) => themesMap.get(id)).filter(Boolean);
  const relatedPlaces = film.places.map((id) => placesMap.get(id)).filter(Boolean);
  const relatedHistory = film.history.map((id) => historyMap.get(id)).filter(Boolean);
  write(`films/${film.id}`, layout({ title: film.title, current: "films", description: film.synopsis.slice(0, 155), body: `<article class="detail shell"><a class="back" href="/films/">← All films</a><p class="kicker">${film.year ?? "Year unknown"}${director ? ` · ${escape(director.name)}` : ""}</p><h1>${escape(film.title)}</h1>${film.alternativeTitle && film.alternativeTitle !== film.title ? `<p class="subtitle">${escape(film.alternativeTitle)}</p>` : ""}${status}<div class="prose"><p>${escape(film.synopsis)}</p></div><dl class="facts">${director ? `<div><dt>Director</dt><dd><a href="/people/${director.id}/">${escape(director.name)}</a></dd></div>` : ""}${relatedPlaces.length ? `<div><dt>Places</dt><dd>${relatedPlaces.map((item) => escape(item.name)).join(", ")}</dd></div>` : ""}${relatedThemes.length ? `<div><dt>Themes</dt><dd>${relatedThemes.map((item) => escape(item.name)).join(", ")}</dd></div>` : ""}</dl>${relatedHistory.length ? `<section><h2>Historical context</h2>${relatedHistory.map((item) => `<article class="context"><p class="eyebrow">${escape(item.period ?? "Context")}</p><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p></article>`).join("")}</section>` : ""}<section class="sources"><h2>Source notes</h2>${film.sources.map((source) => `<p>${escape(source.note)}</p>`).join("")}<p class="notice">These imported notes need to be replaced with direct, structured citations.</p></section></article>` }));
}

write("history", layout({ title: "History", current: "history", description: "A developing timeline of Malagasy cinema and audiovisual history.", body: `<header class="page shell"><p class="kicker">Context</p><h1>History of the field</h1><p class="lead">A concise, source-led timeline connecting films and people to the events and institutions that shaped Malagasy cinema.</p></header><section class="shell timeline">${history.map((item) => `<article><p class="eyebrow">${escape(item.period ?? "Date being documented")}</p><h2>${escape(item.title)}</h2>${status}<p>${escape(item.description)}</p></article>`).join("")}</section>` }));
write("organisations", layout({ title: "Organisations", current: "organisations", description: "Organisations across Madagascar's film and audiovisual field.", body: `<header class="page shell"><p class="kicker">Directory</p><h1>Organisations</h1><p class="lead">Production companies, festivals, schools, cinemas, archives, associations and collectives will be documented here.</p><a class="button primary" href="/contribute/">Help begin this directory</a></header>` }));
write("opportunities", layout({ title: "Opportunities", current: "opportunities", description: "Current opportunities for Madagascar's film and audiovisual community.", body: `<header class="page shell"><p class="kicker">Current calls</p><h1>Opportunities</h1><p class="lead">Funding, training, residencies, festivals, jobs and calls for projects—with clear deadlines and automatic archiving.</p><a class="button primary" href="/contribute/">Share an opportunity</a></header>` }));
write("about", layout({ title: "About", description: "About Filmada, an open directory of Madagascar's film and audiovisual field.", body: `<article class="page shell narrow"><p class="kicker">About Filmada</p><h1>A shared map of Malagasy cinema</h1><div class="prose"><p>Filmada is an open, collaborative directory of Madagascar's film and audiovisual field.</p><p>It documents the people, films, organisations, places, opportunities, resources and history that shape Malagasy cinema. Its purpose is to make the field easier to discover, understand and join.</p><p>Filmada began as a personal directory and is now being rebuilt as shared public infrastructure. Its code and structured data are developed openly on GitHub.</p></div></article>` }));
write("contribute", layout({ title: "Contribute", description: "Help document Madagascar's film and audiovisual field.", body: `<article class="page shell narrow"><p class="kicker">Open directory</p><h1>Help build Filmada</h1><p class="lead">You do not need technical knowledge to contribute. What matters is care, reliable information and commitment to Madagascar's film community.</p><div class="steps"><section><span>01</span><h2>Suggest something</h2><p>Tell us about a missing person, film, organisation, opportunity or correction. Include a reliable source whenever possible.</p></section><section><span>02</span><h2>Join as an editor</h2><p>Committed contributors can request access to Filmada's simple editorial interface and maintain part of the directory.</p></section><section><span>03</span><h2>Review together</h2><p>Changes remain traceable and reversible. New contributors can submit records for review before publication.</p></section></div><p class="notice">Contribution links will be activated when Filmada's public GitHub repository and editorial group are ready.</p></article>` }));

const notFound = layout({ title: "Page not found", description: "This Filmada page could not be found.", body: `<article class="page shell narrow"><p class="kicker">404</p><h1>Page not found</h1><p class="lead">This page may have moved as Filmada's directory evolves.</p><a class="button primary" href="/">Return to Filmada</a></article>` });
writeFileSync(path.join(dist, "404.html"), notFound);

const searchIndex = [...films.map((item) => ({ type: "Film", title: item.title, text: item.synopsis, url: `/films/${item.id}/` })), ...people.map((item) => ({ type: "Person", title: item.name, text: item.biography, url: `/people/${item.id}/` }))];
writeFileSync(path.join(dist, "search-index.json"), JSON.stringify(searchIndex));
writeFileSync(path.join(dist, ".nojekyll"), "");
console.log(`Built Filmada with ${people.length} people, ${films.length} films and ${history.length} history entries.`);
