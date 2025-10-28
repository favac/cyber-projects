import { h } from "../lib/h.ts";
import { login } from "../lib/api.ts";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly onSwitchToRegister: () => void;
}

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

export function createLoginModal(props: LoginModalProps): HTMLElement | null {
  if (!props.isOpen) {
    return null;
  }

  const formData: LoginFormData = {
    email: "",
    password: "",
  };

  let errorMessage = "";
  let isLoading = false;
  let modalElement: HTMLElement | null = null;

  const handleClose = (): void => {
    props.onClose();
  };

  const updateError = (message: string): void => {
    errorMessage = message;
    const errorEl = document.querySelector(".para-form-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle("para-form-error--visible", !!message);
    }
  };

  const updateLoadingState = (loading: boolean): void => {
    isLoading = loading;
    const submitBtn = document.querySelector<HTMLButtonElement>(
      ".para-login-submit"
    );
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "SIGNING IN..." : "SIGN IN";
    }
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    updateError("");
    updateLoadingState(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      props.onSuccess();
      handleClose();
    } catch (error) {
      updateError(error instanceof Error ? error.message : "Login failed");
    } finally {
      updateLoadingState(false);
    }
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
        h("h2", { class: "para-modal__title" }, "SIGN IN"),
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
        h("div", { class: "para-form-error" }, errorMessage),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "EMAIL"),
          h("input", {
            class: "para-form-field__input",
            type: "email",
            placeholder: "your@email.com",
            required: true,
            onInput: (event) => {
              formData.email = (event.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "PASSWORD"),
          h("input", {
            class: "para-form-field__input",
            type: "password",
            placeholder: "Enter your password",
            required: true,
            onInput: (event) => {
              formData.password = (event.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-modal__actions" },
          h(
            "button",
            {
              class: "para-button para-button--primary para-login-submit",
              type: "submit",
            },
            "SIGN IN"
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
        ),
        h(
          "div",
          { class: "para-form-switch" },
          "Don't have an account? ",
          h(
            "button",
            {
              class: "para-form-switch__link",
              type: "button",
              onClick: () => {
                handleClose();
                props.onSwitchToRegister();
              },
            },
            "Create one"
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
