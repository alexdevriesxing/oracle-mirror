const SEARCH_PATH = "/search#focus";

function isEditingTarget(target) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const commandK = (event.ctrlKey || event.metaKey) && key === "k";
  const slash = event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditingTarget(event.target);
  if (!commandK && !slash) return;
  event.preventDefault();
  if (window.location.pathname === "/search" || window.location.pathname === "/search/") {
    const input = document.querySelector("[data-reference-search-input]");
    input?.focus();
    if (input instanceof HTMLInputElement) input.select();
    return;
  }
  window.location.assign(SEARCH_PATH);
});
