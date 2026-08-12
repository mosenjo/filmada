import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = process.argv[2];
if (!sourceFile) throw new Error("Usage: node scripts/import-people-archive.mjs path/to/archive.csv");

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(value); value = ""; }
    else if (character === "\n") { row.push(value); rows.push(row); row = []; value = ""; }
    else if (character !== "\r") value += character;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

const clean = (value = "") => value.replace(/[\t\n\r]+/g, " ").replace(/\s+/g, " ").trim();
const fold = (value = "") => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const slug = (value) => fold(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const roleRules = [
  ["Director", /realis|cineaste|metteur en scene/],
  ["Assistant Director", /assistant.*real|assistanat.*real/],
  ["Screenwriter", /scenar|ecriture.*scenario|dialoguiste|script doctor/],
  ["Producer", /producteur|productrice|production audiovisuelle/],
  ["Actor", /acteur|actrice|comedien|comedienne|actorat/],
  ["Cinematography & Camera", /cadreur|cameraman|camera|directeur.*photo|directrice.*photo|cadrage|videaste|drone operator/],
  ["Editing", /montage|monteur|monteuse|editing/],
  ["Sound", /son\b|sound|mixeur|perchman|perchiste|audio/],
  ["Music", /composit|musicien|musique/],
  ["Animation & VFX", /animation|animateur|vfx|effet.*spec|effet.*visuel|motion|3d|2d|infograph/],
  ["Art Department", /direction artistique|directeur artistique|decor|costume|maquillage|dessinateur/],
  ["Criticism & Journalism", /criti|journal|chroniqueur/],
  ["Photography", /photograph/],
  ["Training", /formateur|formatrice|formation/]
];

const rows = parseCsv(readFileSync(sourceFile, "utf8"));
const headers = rows.shift().map(clean);
const records = rows.filter((row) => row.some(clean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, clean(row[index] ?? "")])));
const peopleDir = path.join(root, "data", "people");
mkdirSync(peopleDir, { recursive: true });

const existing = new Map();
for (const id of ["haminiaina-ratovoarivony", "lova-nantenaina", "luck-razanajaona"]) existing.set(id, true);
const aliases = new Map([
  ["ratovoarivony-haminiaina", "haminiaina-ratovoarivony"],
  ["lova-nantenaina", "lova-nantenaina"],
  ["razanajaona-ambinintsoa-luck", "luck-razanajaona"]
]);
const merged = new Map();

for (const row of records) {
  const surname = clean(row.NOM);
  const givenName = clean(row.PRENOM);
  const artistName = clean(row["NOM D'ARTISTE"]);
  if (!surname && !givenName) continue;
  const sourceKey = slug(`${surname}-${givenName}`);
  const existingId = aliases.get(sourceKey);
  if (existingId) continue;
  const id = slug(`${givenName}-${surname}`) || `archival-person-${merged.size + 1}`;
  const rawTitle = clean(row.TITRE);
  const rawSkills = clean(row.COMPETENCES);
  const searchable = fold(`${rawTitle} ${rawSkills}`);
  const roles = roleRules.filter(([, pattern]) => pattern.test(searchable)).map(([role]) => role);
  if (!roles.length) roles.push(rawTitle ? "Other audiovisual profession" : "Role being documented");
  const name = clean(`${givenName} ${surname}`);
  const organisation = clean(row.SOCIETE);
  const selectedWork = clean(row.REFERENCE);
  const current = merged.get(id);
  if (current) {
    current.roles = [...new Set([...current.roles, ...roles])];
    if (!current.professionalSummary && rawSkills) current.professionalSummary = rawSkills;
    if (!current.organisation && organisation) current.organisation = organisation;
    if (!current.selectedWork && selectedWork) current.selectedWork = selectedWork;
    continue;
  }
  merged.set(id, {
    id,
    name,
    ...(artistName ? { professionalName: artistName } : {}),
    roles,
    ...(rawTitle ? { originalRoleDescription: rawTitle } : {}),
    ...(rawSkills ? { professionalSummary: rawSkills } : {}),
    ...(organisation && fold(organisation) !== "independant" ? { organisation } : {}),
    ...(selectedWork ? { selectedWork } : {}),
    biography: "This professional record was recovered from Filmada's earlier community directory. It is awaiting confirmation and a fuller biography.",
    films: [],
    archival: true,
    contactPublished: false,
    sources: [{
      note: "Filmada community directory archive (spreadsheet used for the earlier Weebly annuaire). Original collection date unknown; professional details require confirmation.",
      url: "https://filmada.weebly.com/annuaire.html"
    }],
    status: "needs-review",
    importedAt: "2026-08-12"
  });
}

for (const person of merged.values()) {
  const target = path.join(peopleDir, `${person.id}.json`);
  if (!existsSync(target)) writeFileSync(target, `${JSON.stringify(person, null, 2)}\n`);
}

console.log(`Recovered ${merged.size} safe public profiles from ${records.length} archival rows; 3 existing profiles were preserved.`);
