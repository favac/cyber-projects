import { h } from "../lib/h.ts";
import { register } from "../lib/api.ts";

interface RegisterFormData {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

interface RegisterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly onSwitchToLogin: () => void;
}

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

export function createRegisterModal(
  props: RegisterModalProps
): HTMLElement | null {
  if (!props.isOpen) {
    return null;
  }

  const formData: RegisterFormData = {
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
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
      ".para-register-submit"
    );
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT";
    }
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    updateError("");

    if (formData.password !== formData.confirmPassword) {
      updateError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      updateError("Password must be at least 8 characters");
      return;
    }

    updateLoadingState(true);

    try {
      await register({
        email: formData.email,
        displayName: formData.displayName,
        password: formData.password,
      });
      props.onSuccess();
      handleClose();
    } catch (error) {
      updateError(
        error instanceof Error ? error.message : "Registration failed"
      );
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
        h("h2", { class: "para-modal__title" }, "CREATE ACCOUNT"),
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
          h("label", { class: "para-form-field__label" }, "DISPLAY NAME"),
          h("input", {
            class: "para-form-field__input",
            type: "text",
            placeholder: "John Doe",
            required: true,
            onInput: (event) => {
              formData.displayName = (event.target as HTMLInputElement).value;
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
            placeholder: "Min. 8 characters",
            required: true,
            onInput: (event) => {
              formData.password = (event.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-form-field" },
          h("label", { class: "para-form-field__label" }, "CONFIRM PASSWORD"),
          h("input", {
            class: "para-form-field__input",
            type: "password",
            placeholder: "Re-enter password",
            required: true,
            onInput: (event) => {
              formData.confirmPassword = (
                event.target as HTMLInputElement
              ).value;
            },
          })
        ),
        h(
          "div",
          { class: "para-modal__actions" },
          h(
            "button",
            {
              class: "para-button para-button--primary para-register-submit",
              type: "submit",
            },
            "CREATE ACCOUNT"
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
          "Already have an account? ",
          h(
            "button",
            {
              class: "para-form-switch__link",
              type: "button",
              onClick: () => {
                handleClose();
                props.onSwitchToLogin();
              },
            },
            "Sign in"
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
