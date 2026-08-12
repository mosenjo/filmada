import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const names = ["people", "films", "places", "themes", "history"];
const collections = Object.fromEntries(names.map((name) => [name, readdirSync(path.join(root, "data", name)).filter((file) => file.endsWith(".json")).map((file) => JSON.parse(readFileSync(path.join(root, "data", name, file), "utf8")))]));
const errors = [];
const ids = {};

for (const [name, records] of Object.entries(collections)) {
  ids[name] = new Set();
  for (const record of records) {
    if (!record.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) errors.push(`${name}: invalid id ${record.id}`);
    if (ids[name].has(record.id)) errors.push(`${name}: duplicate id ${record.id}`);
    ids[name].add(record.id);
    if (!record.status) errors.push(`${name}/${record.id}: status is required`);
  }
}

for (const film of collections.films) {
  if (!film.title || !film.synopsis) errors.push(`films/${film.id}: title and synopsis are required`);
  if (film.primaryDirector && !ids.people.has(film.primaryDirector)) errors.push(`films/${film.id}: unknown director ${film.primaryDirector}`);
  for (const credit of film.credits ?? []) if (!ids.people.has(credit.person)) errors.push(`films/${film.id}: unknown person ${credit.person}`);
  for (const id of film.themes ?? []) if (!ids.themes.has(id)) errors.push(`films/${film.id}: unknown theme ${id}`);
  for (const id of film.places ?? []) if (!ids.places.has(id)) errors.push(`films/${film.id}: unknown place ${id}`);
  for (const id of film.history ?? []) if (!ids.history.has(id)) errors.push(`films/${film.id}: unknown history ${id}`);
}
for (const person of collections.people) for (const film of person.films ?? []) if (!ids.films.has(film.id)) errors.push(`people/${person.id}: unknown film ${film.id}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${Object.values(collections).reduce((sum, records) => sum + records.length, 0)} records and their relationships.`);
