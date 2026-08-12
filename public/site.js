const menu = document.querySelector(".menu");
const links = document.querySelector("#navlinks");
if (menu && links) menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  links.classList.toggle("open", !open);
});
