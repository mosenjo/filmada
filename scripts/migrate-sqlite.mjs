import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultArchive = "/Users/njo/Documents/Work/Studio/Websites/Filmada-Web/artifacts/filmada.db";
const database = process.env.FILMADA_ARCHIVE_DB ?? defaultArchive;

function query(sql) {
  const output = execFileSync("sqlite3", ["-readonly", "-json", database, sql], { encoding: "utf8" });
  return output.trim() ? JSON.parse(output) : [];
}

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function writeCollection(name, records) {
  const directory = path.join(root, "data", name);
  mkdirSync(directory, { recursive: true });
  for (const record of records) {
    writeFileSync(path.join(directory, `${record.id}.json`), `${JSON.stringify(record, null, 2)}\n`);
  }
  return records.length;
}

const peopleRows = query("SELECT id, name, role, biography, photo, source_notes, created_at FROM filmmakers ORDER BY id");
const filmRows = query("SELECT id, title, original_title, year, synopsis, director_id, poster_image, source_notes, created_at FROM films ORDER BY year, id");
const placeRows = query("SELECT id, name, region, description, created_at FROM places ORDER BY id");
const themeRows = query("SELECT id, name, description, created_at FROM themes ORDER BY id");
const historyRows = query("SELECT id, title, description, period, year, media, created_at FROM fragments ORDER BY id");

const peopleByNumber = new Map(peopleRows.map((row) => [row.id, slug(row.name)]));
const filmsByNumber = new Map(filmRows.map((row) => [row.id, slug(row.title)]));
const placesByNumber = new Map(placeRows.map((row) => [row.id, slug(row.name)]));
const themesByNumber = new Map(themeRows.map((row) => [row.id, slug(row.name)]));
const historyByNumber = new Map(historyRows.map((row) => [row.id, slug(row.title)]));

const credits = query("SELECT filmmaker_id, film_id, role FROM filmmaker_films ORDER BY film_id, filmmaker_id");
const filmThemes = query("SELECT film_id, theme_id FROM film_themes ORDER BY film_id, theme_id");
const filmPlaces = query("SELECT film_id, place_id FROM film_places ORDER BY film_id, place_id");
const filmHistory = query("SELECT film_id, fragment_id FROM film_fragments ORDER BY film_id, fragment_id");
const historyPlaces = query("SELECT fragment_id, place_id FROM fragment_places ORDER BY fragment_id, place_id");

const people = peopleRows.map((row) => ({
  id: peopleByNumber.get(row.id),
  name: row.name,
  roles: row.role ? [row.role] : [],
  biography: row.biography ?? "",
  image: row.photo ?? null,
  films: credits.filter((item) => item.filmmaker_id === row.id).map((item) => ({ id: filmsByNumber.get(item.film_id), role: item.role })),
  sources: row.source_notes ? [{ note: row.source_notes, url: null }] : [],
  status: "needs-review",
  importedAt: row.created_at
}));

const films = filmRows.map((row) => ({
  id: filmsByNumber.get(row.id),
  title: row.title,
  alternativeTitle: row.original_title ?? null,
  year: row.year,
  type: null,
  synopsis: row.synopsis ?? "",
  credits: credits.filter((item) => item.film_id === row.id).map((item) => ({ person: peopleByNumber.get(item.filmmaker_id), role: item.role })),
  primaryDirector: row.director_id ? peopleByNumber.get(row.director_id) : null,
  themes: filmThemes.filter((item) => item.film_id === row.id).map((item) => themesByNumber.get(item.theme_id)),
  places: filmPlaces.filter((item) => item.film_id === row.id).map((item) => placesByNumber.get(item.place_id)),
  history: filmHistory.filter((item) => item.film_id === row.id).map((item) => historyByNumber.get(item.fragment_id)),
  image: row.poster_image ?? null,
  sources: row.source_notes ? [{ note: row.source_notes, url: null }] : [],
  status: "needs-review",
  importedAt: row.created_at
}));

const places = placeRows.map((row) => ({ id: placesByNumber.get(row.id), name: row.name, region: row.region, description: row.description ?? "", status: "needs-review" }));
const themes = themeRows.map((row) => ({ id: themesByNumber.get(row.id), name: row.name, description: row.description ?? "", status: "needs-review" }));
const history = historyRows.map((row) => ({
  id: historyByNumber.get(row.id), title: row.title, description: row.description ?? "", period: row.period, year: row.year,
  places: historyPlaces.filter((item) => item.fragment_id === row.id).map((item) => placesByNumber.get(item.place_id)),
  media: row.media ?? null, sources: [], status: "needs-review"
}));

const counts = {
  people: writeCollection("people", people),
  films: writeCollection("films", films),
  places: writeCollection("places", places),
  themes: writeCollection("themes", themes),
  history: writeCollection("history", history)
};

console.log(`Migrated ${Object.entries(counts).map(([name, count]) => `${count} ${name}`).join(", ")}.`);
