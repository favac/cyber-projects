import { h } from "../lib/h.js";

export function Card({
  title,
  description = "",
  status = "pending",
  priority = "medium",
  createdAt,
  onToggleStatus,
  onDelete,
  className = "",
}) {
  const formatDate = (date) => {
    if (!date) {
      return "";
    }
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusInfo = (currentStatus) => {
    switch (currentStatus) {
      case "completed":
        return { icon: "✅", text: "Completed", class: "status-completed" };
      case "in-progress":
        return { icon: "🔄", text: "In Progress", class: "status-in-progress" };
      default:
        return { icon: "⏳", text: "Pending", class: "status-pending" };
    }
  };

  const getPriorityInfo = (currentPriority) => {
    switch (currentPriority) {
      case "high":
        return { icon: "🔴", text: "High", class: "priority-high" };
      case "low":
        return { icon: "🟢", text: "Low", class: "priority-low" };
      default:
        return { icon: "🟡", text: "Medium", class: "priority-medium" };
    }
  };

  const statusInfo = getStatusInfo(status);
  const priorityInfo = getPriorityInfo(priority);

  return h(
    "div",
    {
      class: `card task-card ${statusInfo.class} ${className}`.trim(),
    },
    [
      h("div", { class: "card-header" }, [
        h("h3", { class: "card-title" }, title),
        h("span", { class: `priority-badge ${priorityInfo.class}` }, [
          priorityInfo.icon,
          " ",
          priorityInfo.text,
        ]),
      ]),
      description
        ? h("div", { class: "card-body" }, [
            h("p", { class: "card-description" }, description),
          ])
        : null,
      h("div", { class: "card-footer" }, [
        h("div", { class: "card-info" }, [
          h("span", { class: `status-badge ${statusInfo.class}` }, [
            statusInfo.icon,
            " ",
            statusInfo.text,
          ]),
          createdAt
            ? h("span", { class: "card-date" }, formatDate(createdAt))
            : null,
        ]),
        h("div", { class: "card-actions" }, [
          onToggleStatus
            ? h(
                "button",
                {
                  class: "btn btn-sm btn-secondary",
                  onclick: onToggleStatus,
                  title: "Toggle status",
                },
                "Toggle"
              )
            : null,
          onDelete
            ? h(
                "button",
                {
                  class: "btn btn-sm btn-danger",
                  onclick: onDelete,
                  title: "Delete task",
                },
                "Delete"
              )
            : null,
        ]),
      ]),
    ]
  );
}

export function SimpleCard({ title, content, className = "", actions = [] }) {
  return h(
    "div",
    { class: `card simple-card ${className}`.trim() },
    [
      title
        ? h("div", { class: "card-header" }, [
            h("h3", { class: "card-title" }, title),
          ])
        : null,
      content
        ? h("div", { class: "card-body" }, [
            typeof content === "string" ? h("p", {}, content) : content,
          ])
        : null,
      actions.length > 0
        ? h("div", { class: "card-footer" }, [
            h("div", { class: "card-actions" }, actions),
          ])
        : null,
    ]
  );
}
