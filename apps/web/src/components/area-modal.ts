import { h } from "../lib/h.ts";

export interface AreaFormData {
  name: string;
  description: string;
  colorHex: string;
  iconName: string;
}

interface AreaModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: AreaFormData) => void;
}

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

export function createAreaModal(props: AreaModalProps): HTMLElement | null {
  if (!props.isOpen) {
    return null;
  }

  const formData: AreaFormData = {
    name: "",
    description: "",
    colorHex: "#00FF7F",
    iconName: "",
  };

  let modalElement: HTMLElement | null = null;

  const handleClose = (): void => {
    props.onClose();
  };

  const handleSubmit = (event: Event): void => {
    event.preventDefault();
    props.onSubmit(formData);
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
        h("h2", { class: "para-modal__title" }, "CREATE NEW AREA"),
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
          h("label", { class: "para-form-field__label" }, "NAME"),
          h("input", {
            class: "para-form-field__input",
            type: "text",
            placeholder: "e.g., Health & Fitness",
            required: true,
            onInput: (event) => {
              formData.name = (event.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "DESCRIPTION"),
          h("textarea", {
            class: "para-form-field__textarea",
            placeholder: "e.g., All things related to diet, exercise, and well-being.",
            rows: 4,
            onInput: (event) => {
              formData.description = (event.target as HTMLTextAreaElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "COLOR HEX"),
          h(
            "div",
            { class: "para-form-field__color-input" },
            h("input", {
              class: "para-form-field__color-picker",
              type: "color",
              value: formData.colorHex,
              onInput: (event) => {
                formData.colorHex = (event.target as HTMLInputElement).value;
                const display = document.querySelector<HTMLInputElement>(
                  ".para-form-field__color-text"
                );
                if (display) {
                  display.value = formData.colorHex;
                }
              },
            }),
            h("input", {
              class: "para-form-field__color-text",
              type: "text",
              value: formData.colorHex,
              placeholder: "#00FF7F",
              onInput: (event) => {
                formData.colorHex = (event.target as HTMLInputElement).value;
              },
            })
          )
        ),
        h(
          "div",
          { class: "para-form-field" },
          h(
            "label",
            { class: "para-form-field__label" },
            "ICON NAME"
          ),
          h("input", {
            class: "para-form-field__input",
            type: "text",
            placeholder: "e.g., heart_pulse",
            onInput: (event) => {
              formData.iconName = (event.target as HTMLInputElement).value;
            },
          }),
          h(
            "a",
            {
              class: "para-form-field__help",
              href: "https://fonts.google.com/icons?utm_source=chatgpt.com",
              target: "_blank",
              rel: "noopener noreferrer",
            },
            "Browse icons →"
          )
        ),
        h(
          "div",
          { class: "para-modal__actions" },
          h(
            "button",
            { class: "para-button para-button--primary", type: "submit" },
            "CREATE AREA"
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
