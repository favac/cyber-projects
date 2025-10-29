import type { Project } from "@cyber/domain";
import { createProject } from "../lib/api.ts";
import { h } from "../lib/h.ts";

export interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  areaId: string;
}

interface ProjectModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onProjectCreated: (newProject: Project) => void;
  readonly areas: readonly { id: string; name: string }[];
}

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

export function createProjectModal(props: ProjectModalProps): HTMLElement | null {
  if (!props.isOpen) {
    return null;
  }

  const formData: ProjectFormData = {
    title: "",
    description: "",
    status: "in-progress",
    areaId: "",
  };

  let modalElement: HTMLElement | null = null;

  const handleClose = (): void => {
    props.onClose();
  };

  const handleSubmit = (event: Event): void => {
    event.preventDefault();
    // Basic validation
    if (!formData.title || !formData.areaId) {
      alert("Please fill in all required fields.");
      return;
    }
    createProject(formData)
      .then(props.onProjectCreated)
      .catch((err) => {
        console.error("Failed to create project:", err);
        // Here you could show an error message to the user
      });
    handleClose();
  };

  const overlay = h(
    "div",
    {
      class: "para-modal-overlay",
      onClick: (event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      },
    },
    h(
      "div",
      {
        class: "para-modal para-modal--animating",
        ref: (el: HTMLElement) => {
          modalElement = el;
        },
      },
      h(
        "div",
        { class: "para-modal__header" },
        h("h2", { class: "para-modal__title" }, "CREATE NEW PROJECT"),
        h(
          "button",
          {
            class: "para-modal__close",
            type: "button",
            onClick: handleClose,
            "aria-label": "Close modal",
          },
          materialIcon("close")
        )
      ),
      h(
        "form",
        { class: "para-modal__form", onSubmit: handleSubmit },
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "TITLE"),
          h("input", {
            class: "para-form-field__input",
            type: "text",
            placeholder: "e.g., Q4 Marketing Campaign",
            required: true,
            onInput: (event) => {
              formData.title = (event.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "DESCRIPTION"),
          h("textarea", {
            class: "para-form-field__textarea",
            placeholder: "e.g., Plan and execute the marketing campaign for Q4.",
            rows: 4,
            onInput: (event) => {
              formData.description = (event.target as HTMLTextAreaElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "AREA"),
          h(
            "select",
            {
              class: "para-form-field__input",
              required: true,
              onInput: (event) => {
                formData.areaId = (event.target as HTMLSelectElement).value;
              },
            },
            h("option", { value: "" }, "Select an area"),
            ...props.areas.map((area) =>
              h("option", { value: area.id }, area.name)
            )
          )
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "STATUS"),
          h(
            "select",
            {
              class: "para-form-field__input",
              onInput: (event) => {
                formData.status = (event.target as HTMLSelectElement).value;
              },
            },
            h("option", { value: "in-progress" }, "In Progress"),
            h("option", { value: "on-hold" }, "On Hold"),
            h("option", { value: "completed" }, "Completed")
          )
        ),
        h(
          "div",
          { class: "para-modal__actions" },
          h(
            "button",
            { class: "para-button para-button--primary", type: "submit" },
            "CREATE PROJECT"
          ),
          h(
            "button",
            {
              class: "para-button para-button--secondary",
              type: "button",
              onClick: handleClose,
            },
            "CANCEL"
          )
        )
      )
    )
  );

  setTimeout(() => {
    if (modalElement) {
      modalElement.classList.remove("para-modal--animating");
    }
  }, 10);

  return overlay;
}
