import { h } from "../lib/h.ts";

export type NotificationType = "info" | "success" | "error";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const notificationIcons: Record<NotificationType, string> = {
  info: "info",
  success: "check_circle",
  error: "error",
};

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

export function createToast({ notification, onClose }: ToastProps): HTMLElement {
  const iconName = notificationIcons[notification.type];

  return h(
    "div",
    { class: `para-toast para-toast--${notification.type}` },
    h("div", { class: "para-toast__icon" }, materialIcon(iconName)),
    h("p", { class: "para-toast__message" }, notification.message),
    h(
      "button",
      {
        class: "para-toast__close",
        type: "button",
        onClick: onClose,
        "aria-label": "Close notification",
      },
      materialIcon("close")
    )
  );
}
