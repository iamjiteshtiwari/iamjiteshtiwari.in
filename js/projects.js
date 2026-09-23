/* Project card behavior
   Keeps future project cards easy to extend without changing main.js.
*/

const projectPreviews = document.querySelectorAll("[data-project-preview]");

projectPreviews.forEach((preview) => {
  preview.addEventListener("load", () => {
    const card = preview.closest(".project-card-template");
    card?.classList.remove("is-loading");
  });

  preview.addEventListener("error", () => {
    const card = preview.closest(".project-card-template");
    card?.classList.remove("is-loading");
    card?.classList.add("is-unavailable");
  });
});
