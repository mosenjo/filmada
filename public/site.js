const menu = document.querySelector(".menu");
const links = document.querySelector("#navlinks");
if (menu && links) menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  links.classList.toggle("open", !open);
});

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
