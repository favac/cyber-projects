export function showModal(content) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  if (!modal || !modalBody) {
    return;
  }
  if (content instanceof Node) {
    modalBody.replaceChildren(content);
  } else {
    modalBody.innerHTML = content;
  }
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  const firstInput = modal.querySelector("input, button, [tabindex]");
  if (firstInput instanceof HTMLElement) {
    firstInput.focus();
  }
}

export function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) {
    return;
  }
  modal.style.display = "none";
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
