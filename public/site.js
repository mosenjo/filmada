const menu = document.querySelector(".menu");
const links = document.querySelector("#navlinks");
if (menu && links) menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  links.classList.toggle("open", !open);
});

const footerBrand = document.querySelector("footer .footer > div:first-child");
if (footerBrand && !footerBrand.querySelector("[data-maker-credit]")) {
  const language = document.documentElement.lang === "fr" ? "fr" : "en";
  const credit = document.createElement("p");
  const link = document.createElement("a");

  credit.setAttribute("data-maker-credit", "");
  credit.style.marginTop = "0.65rem";
  credit.style.fontSize = "0.9em";
  credit.style.opacity = "0.78";
  credit.append(document.createTextNode(language === "fr" ? "Fait avec ❤️ par " : "Made with ❤️ by "));

  link.href = "https://mosenjo.com";
  link.rel = "author";
  link.textContent = "Mose Njo";
  credit.appendChild(link);
  footerBrand.appendChild(credit);
}

const filterRoot = document.querySelector("[data-filter-root]");
if (filterRoot) {
  const search = filterRoot.querySelector("[data-filter-search]");
  const role = filterRoot.querySelector("[data-filter-role]");
  const cards = [...filterRoot.querySelectorAll("[data-filter-card]")];
  const count = filterRoot.querySelector("[data-result-count]");
  const empty = filterRoot.querySelector("[data-filter-empty]");
  const letterButtons = [...filterRoot.querySelectorAll("[data-filter-letter]")];
  let activeLetter = "";

  const update = () => {
    const query = search.value.trim().toLowerCase();
    const selectedRole = role.value;
    let visible = 0;
    for (const card of cards) {
      const textMatches = !query || `${card.dataset.name} ${card.dataset.roles} ${card.textContent.toLowerCase()}`.includes(query);
      const roleMatches = !selectedRole || card.dataset.roles.split("|").includes(selectedRole);
      const letterMatches = !activeLetter || card.dataset.letter === activeLetter;
      const show = textMatches && roleMatches && letterMatches;
      card.hidden = !show;
      if (show) visible += 1;
    }
    count.textContent = String(visible);
    empty.hidden = visible !== 0;
  };

  search.addEventListener("input", update);
  role.addEventListener("change", update);
  for (const button of letterButtons) button.addEventListener("click", () => {
    activeLetter = button.dataset.filterLetter;
    for (const item of letterButtons) item.setAttribute("aria-pressed", String(item === button));
    update();
  });
}

const contributionForm = document.querySelector("[data-contribution-form]");
if (contributionForm) contributionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const error = contributionForm.querySelector("[data-form-error]");
  if (!contributionForm.reportValidity()) {
    error.hidden = false;
    return;
  }
  error.hidden = true;
  const values = new FormData(contributionForm);
  const language = document.documentElement.lang === "fr" ? "fr" : "en";
  const titlePrefix = language === "fr" ? "Contribution" : "Contribution";
  const heading = language === "fr" ? ["Type", "Sujet", "Proposition", "Sources publiques", "Déclaration"] : ["Type", "Subject", "Proposed addition or correction", "Public sources", "Declaration"];
  const declaration = language === "fr" ? "Aucune coordonnée privée n’est incluse et les informations peuvent être examinées publiquement." : "No private contact details are included and the information may be reviewed publicly.";
  const body = `## ${heading[0]}\n${values.get("type")}\n\n## ${heading[1]}\n${values.get("subject")}\n\n## ${heading[2]}\n${values.get("details")}\n\n## ${heading[3]}\n${values.get("sources") || (language === "fr" ? "À ajouter" : "To be added")}\n\n## ${heading[4]}\n${declaration}`;
  const url = new URL("https://github.com/mosenjo/filmada/issues/new");
  url.searchParams.set("title", `${titlePrefix}: ${values.get("subject")}`);
  url.searchParams.set("body", body);
  window.location.href = url.toString();
});
