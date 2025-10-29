import type { Task } from "@cyber/domain";
import { createTask } from "../lib/api.ts";
import { h } from "../lib/h.ts";

export interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: string;
  areaId?: string;
  projectId?: string;
}

interface TaskModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onTaskCreated: (newTask: Task) => void;
  readonly onTaskCreateError: (error: string) => void;
  readonly areas: readonly { id: string; name: string }[];
  readonly projects: readonly { id: string; title: string }[];
}

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

export function createTaskModal(props: TaskModalProps): HTMLElement | null {
  if (!props.isOpen) {
    return null;
  }

  const formData: TaskFormData = {
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  };

  let modalElement: HTMLElement | null = null;

  const handleClose = (): void => {
    props.onClose();
  };

  const handleSubmit = (event: Event): void => {
    event.preventDefault();
    if (!formData.title) {
      alert("Please fill in all required fields.");
      return;
    }

    const dataToSend = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    };

    createTask(dataToSend)
      .then(props.onTaskCreated)
      .catch((err: Error) => {
        props.onTaskCreateError(err.message);
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
        h("h2", { class: "para-modal__title" }, "CREATE NEW TASK"),
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
            placeholder: "e.g., Design new logo",
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
            placeholder: "e.g., Create a new logo for the company",
            rows: 4,
            onInput: (event) => {
              formData.description = (event.target as HTMLTextAreaElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "PRIORITY"),
          h(
            "select",
            {
              class: "para-form-field__input",
              onInput: (event) => {
                formData.priority = (event.target as HTMLSelectElement).value;
              },
            },
            h("option", { value: "low" }, "Low"),
            h("option", { value: "medium", selected: true }, "Medium"),
            h("option", { value: "high" }, "High")
          )
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "AREA"),
          h(
            "select",
            {
              class: "para-form-field__input",
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
          h("label", { class: "para-form-field__label" }, "DUE DATE"),
          h("input", {
            class: "para-form-field__input",
            type: "date",
            onInput: (event) => {
              formData.dueDate = (event.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "PROJECT"),
          h(
            "select",
            {
              class: "para-form-field__input",
              onInput: (event) => {
                formData.projectId = (event.target as HTMLSelectElement).value;
              },
            },
            h("option", { value: "" }, "Select a project"),
            ...props.projects.map((project) =>
              h("option", { value: project.id }, project.title)
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
            h("option", { value: "todo", selected: true }, "To Do"),
            h("option", { value: "in-progress" }, "In Progress"),
            h("option", { value: "done" }, "Done")
          )
        ),
        h(
          "div",
          { class: "para-modal__actions" },
          h(
            "button",
            { class: "para-button para-button--primary", type: "submit" },
            "CREATE TASK"
          ),
          h(
            "button",
            { class: "para-button para-button--secondary", type: "button", onClick: handleClose },
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
