import "./styles/para.css";
import { clear, h, mount } from "./lib/h.ts";
import { createPersistentStore } from "./stores/persistent-store.ts";
import { createAreaModal } from "./components/area-modal.ts";
import { createProjectModal } from "./components/project-modal.ts";
import { createTaskModal } from "./components/task-modal.ts";
import { createLoginModal } from "./components/login-modal.ts";
import { createRegisterModal } from "./components/register-modal.ts";
import { createToast, type Notification } from "./components/toast.ts";
import {
  isAuthenticated,
  logout,
  getCurrentUser,
  getAreas,
  getProjects,
  getTasks,
} from "./lib/api.ts";
import type { Area } from "@cyber/domain";

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

interface AppState {
  readonly activeSectionId: string;
  readonly isModalOpen: boolean;
  readonly isLoginModalOpen: boolean;
  readonly isRegisterModalOpen: boolean;
  readonly isAuthenticated: boolean;
  readonly userName: string;
  readonly areas: readonly AreaCardData[];
  readonly isLoadingAreas: boolean;
  readonly projects: readonly ProjectCardData[];
  readonly isLoadingProjects: boolean;
  readonly isProjectModalOpen: boolean;
  readonly isTaskModalOpen: boolean;
  readonly tasks: readonly TaskCardData[];
  readonly isLoadingTasks: boolean;
  readonly notifications: readonly Notification[];
}

interface ProjectCardData {
  readonly id: string;
  readonly title: string;
  readonly dueLabel: string;
  readonly status: ProjectStatus;
}

type ProjectStatus = "in-progress" | "on-hold" | "completed";

interface AreaCardData {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly icon: string;
}

interface ResourceCardData {
  readonly id: string;
  readonly label: string;
  readonly meta: string;
  readonly image: string;
  readonly aspectRatio: string;
}

interface ArchiveCardData {
  readonly id: string;
  readonly label: string;
  readonly meta: string;
  readonly image: string;
  readonly aspectRatio: string;
}

interface TaskCardData {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly priority: string;
  readonly createdAt: string;
  readonly dueDate?: string;
}

const navItems: readonly NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    id: "search",
    label: "Search",
    icon: "search",
  },
  {
    id: "new-area",
    label: "New Area",
    icon: "add_circle",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
  },
];

const projectStatusClassMap: Record<ProjectStatus, string> = {
  "in-progress": "para-tag para-tag--in-progress",
  "on-hold": "para-tag para-tag--on-hold",
  completed: "para-tag para-tag--completed",
};

const resourceCards: readonly ResourceCardData[] = [
  {
    id: "design",
    label: "Design Inspiration",
    meta: "Updated yesterday",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5SEVAyAj23ZFtgczOauCcRs_0yC6zdN_IqCXCUtI85Mv-C7zVr7Es3xI8dzZXozHxpiczlqGynn-v6ubezELFCjfjWIdjVcDjyYY6nJfLaOgD12AoyPDouOCVi2AN2fUVWG8l_0s0KyzOkJeURjGgzWARWfGPOkktCJrIngjCYqzDx8LanYP93C6FPMx_uqWYmJXiHXl3q36U8oOMHN0PFFD1gGvn_83v1neHX4wuB9DJuKOXumLJhyErGCgAKryauvFOLGkKrA')",
    aspectRatio: "4 / 3",
  },
  {
    id: "articles",
    label: "Web Articles",
    meta: "3 new articles",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDA-3Av3YtQ442hB9m8rG1diYXGVJQliG91wl25OixLzKX7T8YzlwdqGvxM6uoKz7VKvLz3-gtUFJXOsgAsj9J-BeLImI3XbsoRngmrniLlorIcBW4LNoldi5RoakBdcOymxmo252jRvQZ3lOEyYpjvVOEPoQ-ImsAiqyi_NYUuUre3OfuiC3tQHKF0Y3fMxeTlMiOdYOWaQR2VpmC-y4uN2R_wwpC1VzjW4PauQjX-iDyUQk1pXau0rOTzBAWgK2vvIP1hqKKUw')",
    aspectRatio: "3 / 4",
  },
  {
    id: "snippets",
    label: "Coding Snippets",
    meta: "Last updated 2 days ago",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHO8nJ1PBpbZ9RHBwa7T48PP7yD9ScjBnCr81lOXMkHSsZA7WdeW-zQdBk-kxNhm6QRxbPUtWwEITeaNkqHpGxQNsMTH1B4Kvl3G9-0ijt5sgNaQgWamEfwPueo9t032ZhhGvDHceKSnhLouOXnW5__V-DVm074AeS1hmHQ5l7BTcwVCpPvVY3O-ccqYPfmYXqyKUe21utIL9ha96RTCZFidEdLe_5aH66JIswqJkcCB8XxX58jKabiLNsC7wsatjgPslKOxuIzw')",
    aspectRatio: "16 / 9",
  },
  {
    id: "abstract",
    label: "Abstract Forms",
    meta: "New discovery",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNIh_zPLQF9qltCSvSE4UhQ_4NELKryjAwLHiMKTeG_P4_TwmtBb7tbPug92BWA90yypKHTnMmVfPTX7QBYGzy1oHbI4SIZKAz_OB38EeYCZARR7LV4HEHUB19TubK-W4Mjd5H9CH8M09HAmwZ20IpmUOX_RcoGotQkFAE79GIEOF2lGMGzj3ylWUAawSbqXvoUvk7SxhmEvV4iq5XzyRFpIm6bnR_S_g3xo_-jzjttCkVCmnHxsBTVKOuKfyGGjSqdG4WJLK8KA')",
    aspectRatio: "5 / 4",
  },
  {
    id: "brutalist",
    label: "Brutalist Arch.",
    meta: "Collected 3 days ago",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDF56UoA9BXaeqvnPKZqoGhV0Pib9CsdRsgbPtanuVI0aHWGWp7U8R1KbMpSLksnB3j4y36nuumCPjp9KyfUYl51DHYJoTkB4tVo_xF_VqSDslf6J_fdtAvUDfV2PHqBvm2QC-81YDIUn6pHEn1dQW0gOvARLYIEec0uucyQHWaDxXo7vQJos4C4vpGfvLhu97FrrNKoWe6oC_zs_X4ouGYbFj2_ek0_BOhwt7ktPDbS7Fepb7IBsP5AglCBhnlSePhbPW4-tZlOg')",
    aspectRatio: "4 / 3",
  },
  {
    id: "futuristic",
    label: "Futuristic UI",
    meta: "Added an hour ago",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBk7LW_oLlmhpMdir5lx8xYEx2W5o8peyJiiRdWaoBdTQ55SInXNPfwVRn5fg-zVh_EVDj3TKstYKOwKel3X-YVr6rh4EMvMka7S1W02OF6VJU1090bWCrRB2M_ksUD1-v-xhV35ypL2ONMg_hXZYUZ--9M5SZmtSy4y3pvEw_I-dxEqywtDONT35bJjA_KKULumjB2GvIy5sgeWHd2mZq74K2-WFFv1R-yiBfWOBw0qFJklyzZ7utUrINj7PdtG6IK1JCbs93ePQ')",
    aspectRatio: "4 / 5",
  },
];

const archiveCards: readonly ArchiveCardData[] = [
  {
    id: "vintage",
    label: "Vintage Aesthetics",
    meta: "Archived 2 months ago",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAt3rBgztxwTXipsBuwo9HadS5RXR6BApNtFLxp0vo_r2hZ0Nph-b0Gg681SF4eKDH4rKobFUsDSkfDwTcqAmHzX9XbIwx-WljYkQwXytaXiModd4W1EzMmnd6SgZRzbxuegl0BEP6nuhWK_kgayrWAGHeUbP_O8_Hsw96FRX85wQsouQdgw6wQNPZNWt9dfs30G-QLN4oAsoyTiZh2cRD_aqmrQeJn8LRZgrmbsAioN4pJWtGORSYdd2yTDfZ5HXGj3YC3mnTEzA')",
    aspectRatio: "3 / 2",
  },
  {
    id: "minimal-product",
    label: "Minimal Product Design",
    meta: "Archived last year",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABN5_XlZcZzhjFYc1hPqNZbVJt93xESkZbESpg5AqMdRi56TURdF81fr6KJVx0_oluHIm_kp3ST5mIUD0qcQkf8-pnm6kdJzEfD0Hqm4e0_oeWmQseOCdWOg3GcLUIhURjM-ViXKhxuvtoC8PLUHXzhM6weSB5geWEgCgpc9VtLAt47uCLK0C3AWs9gzRit1YsLHwYcorbpizv2JmuuIQ13AiRuIyT6RQGkUeje2m0-zrWBmvwsE4S6tkffDYHgB_vdajKQ2NXLQ')",
    aspectRatio: "5 / 4",
  },
  {
    id: "landscape",
    label: "Landscape Photography",
    meta: "Archived 6 months ago",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEQin7TYOIFR8cxdeWmjtbQE1w1nYCskG5nW-ToUVfS-vFwPgFFqV7cY2KvkiZe5F_zA8qZJZfxFfcSdXgFa8hIzOhfOXy3-5E1r7QxatrdVfxfyeHGp-NvKr02mNSDpOnw2VOhRs5bdgb2FLlddwHxlA05-6VBbNL2T0f4GuBa1WM8_g8JpDvzDQ-UPjGiWQ82ipfGh3TRlTcjksk4KqRGbVoatzkPb6ZS-m3zGVU1X3aHj8y_QpXtrQVuZjmTUodcb5Xqs1zOw')",
    aspectRatio: "4 / 3",
  },
  {
    id: "typography",
    label: "Modern Typography",
    meta: "Archived 1 year ago",
    image:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCVJHNE5NgGt4dnZvvU7pALmqajGal-xnNIcIyUOBXHE0VNrvaoU35XxwVC8yvEOTxxSmzAr7NrLSj95yb7K5z9BJEJ16h9Mg_RcrwMhAEnZcx-rs3Nf54bkISWdcjW3sRDGpuLnQfsU5I0vmKOoVqnkw8y4CG5y-hRmKa8We-eAnR9JH6EqIU54lBnKuzvCesBaptyyhdgWpP9jM8bhqxcxrreUndPCdaTxvZs0j9pNtWVdEdhZTx0CiQqn4u6QXWR7_zyttKNQ')",
    aspectRatio: "3 / 4",
  },
];

const store = createPersistentStore<AppState>("para-app", {
  activeSectionId: "dashboard",
  isModalOpen: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isAuthenticated: isAuthenticated(),
  userName: "",
  areas: [],
  isLoadingAreas: true,
  projects: [],
  isLoadingProjects: true,
  isProjectModalOpen: false,
  isTaskModalOpen: false,
  tasks: [],
  isLoadingTasks: true,
  notifications: [],
});

function materialIcon(name: string, className?: string): HTMLElement {
  return h(
    "span",
    { class: ["material-symbols-outlined", "para-icon", className ?? ""] },
    name
  );
}

function createNavBrand(): HTMLElement {
  return h(
    "div",
    { class: "para-nav__brand" },
    h(
      "div",
      { class: "para-nav__brand-icon" },
      materialIcon("design_services")
    ),
    h("h1", { class: "para-nav__brand-title" }, "CREATIVE HQ")
  );
}

function createNavItem(item: NavItem, isActive: boolean): HTMLElement {
  return h(
    "a",
    {
      class: [
        "para-nav__link-option",
        isActive ? "para-nav__link-option--active" : "",
      ],
      href: "#",
      onClick: (event) => {
        event.preventDefault();
        if (item.id === "new-area") {
          store.update({ ...store.get(), isModalOpen: true });
        } else {
          store.update({ ...store.get(), activeSectionId: item.id });
        }
      },
    },
    materialIcon(item.icon),
    h("span", {}, item.label)
  );
}

function renderNavigation(state: AppState): HTMLElement {
  return h(
    "nav",
    { class: "para-nav" },
    h(
      "div",
      { class: "para-nav__primary" },
      createNavBrand(),
      h(
        "div",
        { class: "para-nav__links" },
        navItems.map((item) =>
          createNavItem(item, state.activeSectionId === item.id)
        )
      )
    )
  );
}

function renderTopbar(state: AppState): HTMLElement {
  const authActions = state.isAuthenticated
    ? [
        h(
          "button",
          { class: "para-icon-button", type: "button" },
          materialIcon("notifications"),
          h("span", { class: "para-icon-button__badge" })
        ),
        h("div", { class: "para-avatar" }),
        h(
          "button",
          {
            class: "para-button para-button--secondary",
            type: "button",
            style: { padding: "0 16px", height: "36px", fontSize: "11px" },
            onClick: () => {
              logout();
              store.update({
                ...store.get(),
                isAuthenticated: false,
                userName: "",
              });
            },
          },
          "LOGOUT"
        ),
      ]
    : [
        h(
          "button",
          {
            class: "para-button para-button--secondary",
            type: "button",
            style: { padding: "0 16px", height: "36px", fontSize: "11px" },
            onClick: () => {
              store.update({ ...store.get(), isLoginModalOpen: true });
            },
          },
          "SIGN IN"
        ),
        h(
          "button",
          {
            class: "para-button para-button--primary",
            type: "button",
            style: { padding: "0 16px", height: "36px", fontSize: "11px" },
            onClick: () => {
              store.update({ ...store.get(), isRegisterModalOpen: true });
            },
          },
          "SIGN UP"
        ),
      ];

  return h(
    "header",
    { class: "para-topbar" },
    h(
      "label",
      { class: "para-search" },
      h("span", { class: "para-search__icon" }, materialIcon("search")),
      h("input", {
        class: "para-search__input",
        placeholder: "SEARCH CREATIVE ASSETS...",
        type: "search",
      })
    ),
    h("div", { class: "para-topbar__actions" }, ...authActions)
  );
}

function createProjectCard(card: ProjectCardData): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--project" },
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" }, card.title),
      h("p", { class: "para-card__meta" }, card.dueLabel)
    ),
    h(
      "span",
      { class: projectStatusClassMap[card.status] },
      card.status.replace("-", " ").toUpperCase()
    )
  );
}

function createProjectCardSkeleton(): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--project is-loading" },
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" }),
      h("p", { class: "para-card__meta" })
    ),
    h("span", { class: "para-tag" })
  );
}

function createProjectsSection(
  projects: readonly ProjectCardData[],
  isLoading: boolean
): HTMLElement {
  const content = isLoading
    ? Array.from({ length: 3 }, () => createProjectCardSkeleton())
    : projects.length > 0
    ? projects.map((card) => createProjectCard(card))
    : [
        h(
          "div",
          { class: "para-empty-state para-empty-state--projects" },
          materialIcon("warning", "para-empty-state__icon"),
          h(
            "div",
            { class: "para-empty-state__text" },
            h("p", { class: "para-empty-state__title" }, "No hay proyectos"),
            h(
              "p",
              { class: "para-empty-state__description" },
              "Crea un nuevo proyecto para comenzar."
            )
          )
        ),
      ];
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "CURRENT PROJECTS"),
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "16px" } },
        h(
          "a",
          {
            class: "para-section__link",
            href: "#",
            onClick: (e) => {
              e.preventDefault();
              store.update({ ...store.get(), isProjectModalOpen: true });
            },
          },
          materialIcon("add"),
          h("span", { class: "para-section__link-text" }, "NEW PROJECT")
        ),
        h(
          "a",
          { class: "para-section__link", href: "#" },
          h("span", { class: "para-section__link-text" }, "VIEW ALL")
        )
      )
    ),
    h("div", { class: "para-card-grid para-card-grid--projects" }, content)
  );
}

function createAreaCardSkeleton(): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--area is-loading" },
    h("div", { class: "para-area-icon" }),
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" }),
      h("p", { class: "para-card__meta" })
    )
  );
}

function createAreaCard(card: AreaCardData): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--area" },
    materialIcon(card.icon, "para-area-icon"),
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" }, card.label),
      h("p", { class: "para-card__meta" }, card.summary)
    )
  );
}

function createAreasSection(
  areas: readonly AreaCardData[],
  isLoading: boolean
): HTMLElement {
  const content = isLoading
    ? Array.from({ length: 5 }, () => createAreaCardSkeleton())
    : areas.map((card) => createAreaCard(card));
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "AREAS OF FOCUS"),
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "16px" } },
        h(
          "a",
          {
            class: "para-section__link",
            href: "#",
            onClick: (e) => {
              e.preventDefault();
              store.update({ ...store.get(), isModalOpen: true });
            },
          },
          materialIcon("add"),
          h("span", { class: "para-section__link-text" }, "NEW AREA")
        ),
        h(
          "a",
          { class: "para-section__link", href: "#" },
          h("span", { class: "para-section__link-text" }, "VIEW ALL")
        )
      )
    ),
    h("div", { class: "para-card-grid para-card-grid--areas" }, content)
  );
}

function createResourceCard(card: ResourceCardData): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--resource" },
    h("div", {
      class: "para-card__media",
      style: { backgroundImage: card.image, aspectRatio: card.aspectRatio },
    }),
    h(
      "button",
      {
        class: "para-card__action",
        type: "button",
        "aria-label": `Bookmark resource ${card.label}`,
      },
      materialIcon("bookmark", "para-card__action-icon")
    ),
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" }, card.label),
      h("p", { class: "para-card__meta" }, card.meta)
    )
  );
}

function createResourcesSection(): HTMLElement {
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "INSPIRATION & RESOURCES"),
      h(
        "a",
        { class: "para-section__link", href: "#" },
        materialIcon("add"),
        "QUICK SAVE"
      )
    ),
    h(
      "div",
      { class: "para-masonry" },
      resourceCards.map((card) => createResourceCard(card))
    )
  );
}

function createArchiveCard(card: ArchiveCardData): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--archive" },
    h("div", {
      class: "para-card__media",
      style: { backgroundImage: card.image, aspectRatio: card.aspectRatio },
    }),
    h(
      "button",
      {
        class: "para-card__action",
        type: "button",
        "aria-label": `Browse archive item ${card.label}`,
      },
      materialIcon("unarchive", "para-card__action-icon")
    ),
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" }, card.label),
      h("p", { class: "para-card__meta" }, card.meta)
    )
  );
}

function createTasksSection(
  tasks: readonly TaskCardData[],
  isLoading: boolean
): HTMLElement {
  const content = isLoading
    ? Array.from({ length: 4 }, () => createTaskCardSkeleton())
    : tasks.length > 0
    ? tasks.map((card) => createTaskCard(card))
    : [
        h(
          "div",
          { class: "para-empty-state para-empty-state--tasks" },
          materialIcon("check_circle", "para-empty-state__icon"),
          h(
            "div",
            { class: "para-empty-state__text" },
            h("p", { class: "para-empty-state__title" }, "No hay tareas"),
            h(
              "p",
              { class: "para-empty-state__description" },
              "Crea una nueva tarea para comenzar."
            )
          )
        ),
      ];
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "MY TASKS"),
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "16px" } },
        h(
          "a",
          {
            class: "para-section__link",
            href: "#",
            onClick: (e) => {
              e.preventDefault();
              store.update({ ...store.get(), isTaskModalOpen: true });
            },
          },
          materialIcon("add"),
          h("span", { class: "para-section__link-text" }, "NEW TASK")
        ),
        h(
          "a",
          { class: "para-section__link", href: "#" },
          h("span", { class: "para-section__link-text" }, "VIEW ALL")
        )
      )
    ),
    h("div", { class: "para-card-grid para-card-grid--tasks" }, content)
  );
}

function createTaskCard(card: TaskCardData): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--task" },
    h(
      "div",
      { class: "para-card__row" },
      h("h3", { class: "para-card__title" }, card.title),
      h(
        "div",
        { class: "para-card__badges" },
        h(
          "span",
          { class: `para-tag para-tag--priority-${card.priority.toLowerCase()}` },
          card.priority.toUpperCase()
        ),
        h(
          "span",
          { class: `para-tag para-tag--${card.status.toLowerCase()}` },
          card.status.replace("-", " ").toUpperCase()
        )
      )
    ),
    h(
      "div",
      { class: "para-card__row" },
      h("p", { class: "para-card__meta" }, `Created: ${card.createdAt}`),
      card.dueDate && h("p", { class: "para-card__meta para-card__meta--right" }, `Due: ${card.dueDate}`)
    )
  );
}

function createTaskCardSkeleton(): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--task is-loading" },
    h(
      "div",
      {},
      h("h3", { class: "para-card__title" })
    ),
    h("span", { class: "para-tag" })
  );
}

function createArchiveSection(): HTMLElement {
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "ARCHIVED VISUALS"),
      h(
        "a",
        { class: "para-section__link", href: "#" },
        materialIcon("search"),
        "BROWSE ALL"
      )
    ),
    h(
      "div",
      { class: "para-masonry" },
      archiveCards.map((card) => createArchiveCard(card))
    )
  );
}

function renderSections(state: AppState): HTMLElement {
  return h(
    "div",
    { class: "para-sections" },
    createProjectsSection(state.projects, state.isLoadingProjects),
    createTasksSection(state.tasks, state.isLoadingTasks),
    createAreasSection(state.areas, state.isLoadingAreas),
    createResourcesSection(),
    createArchiveSection()
  );
}

const notificationStore = {
  add: (message: string, type: "success" | "error" | "info") => {
    const id = `notif-${Date.now()}`;
    const currentNotifications = store.get().notifications;
    store.update({
      ...store.get(),
      notifications: [...currentNotifications, { id, message, type }],
    });
    setTimeout(() => {
      notificationStore.remove(id);
    }, 5000);
  },
  remove: (id: string) => {
    const currentNotifications = store.get().notifications;
    store.update({
      ...store.get(),
      notifications: currentNotifications.filter((n) => n.id !== id),
    });
  },
};

function renderNotifications(notifications: readonly Notification[]): HTMLElement {
  return h(
    "div",
    { class: "para-toast-container" },
    ...notifications.map((notification) =>
      createToast({
        notification,
        onClose: () => notificationStore.remove(notification.id),
      })
    )
  );
}

function renderLayout(state: AppState): HTMLElement {
  const handleCloseModal = (): void => {
    store.update({ ...store.get(), isModalOpen: false });
  };

  const handleProjectCreated = async (): Promise<void> => {
    try {
      store.update({
        ...store.get(),
        isProjectModalOpen: false,
        isLoadingProjects: true,
      });

      const projects = await getProjects();
      const projectCards: ProjectCardData[] = projects.map((project) => ({
        id: project.id,
        title: project.title,
        dueLabel: project.dueDate
          ? `Due: ${new Date(project.dueDate).toLocaleDateString()}`
          : "",
        status: project.status as ProjectStatus,
      }));

      store.update({
        ...store.get(),
        projects: projectCards,
        isLoadingProjects: false,
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      store.update({ ...store.get(), isLoadingProjects: false });
    }
  };

  const handleSubmitArea = async (): Promise<void> => {
    try {
      store.update({
        ...store.get(),
        isModalOpen: false,
        isLoadingAreas: true,
      });

      const areas = await getAreas();
      const areaCards: AreaCardData[] = areas.map((area: Area) => ({
        id: area.id,
        label: area.name,
        summary: area.description,
        icon: area.iconName,
      }));

      store.update({ ...store.get(), areas: areaCards, isLoadingAreas: false });
    } catch (error) {
      console.error("Failed to create area:", error);
      store.update({ ...store.get(), isLoadingAreas: false });
    }
  };

  const handleAuthSuccess = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      const [areas, projects, tasks] = await Promise.all([
        getAreas(),
        getProjects(),
        getTasks(),
      ]);

      const areaCards: AreaCardData[] = areas.map((area) => ({
        id: area.id,
        label: area.name,
        summary: area.description,
        icon: area.iconName,
      }));

      const taskCards: TaskCardData[] = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: new Date(task.createdAt).toLocaleDateString(),
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
      }));

      const projectCards: ProjectCardData[] = projects.map((project) => ({
        id: project.id,
        title: project.title,
        dueLabel: project.dueDate
          ? `Due: ${new Date(project.dueDate).toLocaleDateString()}`
          : "",
        status: project.status as ProjectStatus,
      }));

      store.update({
        ...store.get(),
        isAuthenticated: true,
        userName: user.displayName,
        areas: areaCards,
        projects: projectCards,
        tasks: taskCards,
        isLoginModalOpen: false,
        isRegisterModalOpen: false,
        isLoadingAreas: false,
        isLoadingProjects: false,
        isLoadingTasks: false,
      });
    } catch (error) {
      console.error("Failed to get user:", error);
    }
  };

  const handleTaskCreated = async (): Promise<void> => {
    try {
      store.update({
        ...store.get(),
        isTaskModalOpen: false,
        isLoadingTasks: true,
      });

      const tasks = await getTasks();
      const taskCards: TaskCardData[] = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: new Date(task.createdAt).toLocaleDateString(),
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
      }));

      store.update({
        ...store.get(),
        tasks: taskCards,
        isLoadingTasks: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      notificationStore.add(`Failed to create task: ${message}`, "error");
      store.update({ ...store.get(), isLoadingTasks: false });
    }
  };

  const taskModal = createTaskModal({
    isOpen: state.isTaskModalOpen,
    onClose: () => store.update({ ...store.get(), isTaskModalOpen: false }),
    onTaskCreated: () => {
      void handleTaskCreated();
    },
    onTaskCreateError: (error: string) => {
      notificationStore.add(`Failed to create task: ${error}`, "error");
    },
    areas: state.areas.map((a) => ({ id: a.id, name: a.label })),
    projects: state.projects.map((p) => ({ id: p.id, title: p.title })),
  });

  const projectModal = createProjectModal({
    isOpen: state.isProjectModalOpen,
    onClose: () => store.update({ ...store.get(), isProjectModalOpen: false }),
    onProjectCreated: () => {
      void handleProjectCreated();
    },
    areas: state.areas.map((a) => ({ id: a.id, name: a.label })),
  });

  const notifications = renderNotifications(state.notifications);

  const areaModal = createAreaModal({
    isOpen: state.isModalOpen,
    onClose: handleCloseModal,
    onAreaCreated: () => {
      void handleSubmitArea();
    },
  });

  const loginModal = createLoginModal({
    isOpen: state.isLoginModalOpen,
    onClose: () => store.update({ ...store.get(), isLoginModalOpen: false }),
    onSuccess: () => void handleAuthSuccess(),
    onSwitchToRegister: () => {
      store.update({
        ...store.get(),
        isLoginModalOpen: false,
        isRegisterModalOpen: true,
      });
    },
  });

  const registerModal = createRegisterModal({
    isOpen: state.isRegisterModalOpen,
    onClose: () => store.update({ ...store.get(), isRegisterModalOpen: false }),
    onSuccess: () => void handleAuthSuccess(),
    onSwitchToLogin: () => {
      store.update({
        ...store.get(),
        isRegisterModalOpen: false,
        isLoginModalOpen: true,
      });
    },
  });

  const children = [];

  if (state.isAuthenticated) {
    children.push(
      renderNavigation(state),
      h(
        "main",
        { class: "para-main" },
        renderTopbar(state),
        renderSections(state)
      )
    );
    if (areaModal) {
      children.push(areaModal);
    }
    if (projectModal) {
      children.push(projectModal);
    }
    if (taskModal) {
      children.push(taskModal);
    }
  } else {
    children.push(
      h(
        "div",
        {
          class: "para-auth-screen",
          style: {
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "var(--lab-bg-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          },
        },
        h(
          "div",
          {
            style: {
              textAlign: "center",
              padding: "48px",
            },
          },
          h(
            "div",
            {
              style: {
                fontSize: "48px",
                marginBottom: "16px",
              },
            },
            materialIcon("design_services", "para-icon")
          ),
          h(
            "h1",
            {
              style: {
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "32px",
                fontWeight: "700",
                color: "var(--lab-border-glow)",
                marginBottom: "8px",
                letterSpacing: "0.1em",
              },
            },
            "CREATIVE HQ"
          ),
          h(
            "p",
            {
              style: {
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "14px",
                color: "var(--lab-text-muted)",
                marginBottom: "32px",
              },
            },
            "Please sign in to continue"
          ),
          h(
            "div",
            {
              style: {
                display: "flex",
                gap: "16px",
                justifyContent: "center",
              },
            },
            h(
              "button",
              {
                class: "para-button para-button--primary",
                type: "button",
                style: {
                  padding: "0 32px",
                  height: "48px",
                  fontSize: "13px",
                },
                onClick: () => {
                  store.update({ ...store.get(), isLoginModalOpen: true });
                },
              },
              "SIGN IN"
            ),
            h(
              "button",
              {
                class: "para-button para-button--secondary",
                type: "button",
                style: {
                  padding: "0 32px",
                  height: "48px",
                  fontSize: "13px",
                },
                onClick: () => {
                  store.update({ ...store.get(), isRegisterModalOpen: true });
                },
              },
              "SIGN UP"
            )
          )
        )
      )
    );
  }

  if (loginModal) {
    children.push(loginModal);
  }
  if (registerModal) {
    children.push(registerModal);
  }
  if (notifications) {
    children.push(notifications);
  }

  return h("div", { class: "para-app" }, ...children);
}

async function initializeAuth(): Promise<void> {
  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser();
      const [areas, projects, tasks] = await Promise.all([
        getAreas(),
        getProjects(),
        getTasks(),
      ]);

      const areaCards: AreaCardData[] = areas.map((area) => ({
        id: area.id,
        label: area.name,
        summary: area.description,
        icon: area.iconName,
      }));

      const taskCards: TaskCardData[] = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: new Date(task.createdAt).toLocaleDateString(),
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
      }));

      const projectCards: ProjectCardData[] = projects.map((project) => ({
        id: project.id,
        title: project.title,
        dueLabel: project.dueDate
          ? `Due: ${new Date(project.dueDate).toLocaleDateString()}`
          : "",
        status: project.status as ProjectStatus,
      }));

      store.update({
        ...store.get(),
        isAuthenticated: true,
        userName: user.displayName,
        areas: areaCards,
        projects: projectCards,
        tasks: taskCards,
        isLoginModalOpen: false,
        isLoadingAreas: false,
        isLoadingProjects: false,
        isLoadingTasks: false,
      });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      logout();
      store.update({
        ...store.get(),
        isAuthenticated: false,
        userName: "",
        areas: [],
        projects: [],
        tasks: [],
        isLoginModalOpen: true,
        isLoadingAreas: false,
        isLoadingProjects: false,
        isLoadingTasks: false,
      });
    }
  } else {
    store.update({
      ...store.get(),
      isLoadingAreas: false,
      isLoadingProjects: false,
      isLoadingTasks: false,
    });
  }
}

async function bootstrap(): Promise<void> {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) {
    // eslint-disable-next-line no-console
    console.error("Root element #app not found.");
    return;
  }
  clear(root);
  await initializeAuth();
  mount(root, renderLayout(store.get()));
  store.subscribe((state) => {
    mount(root, renderLayout(state));
  });
}

void bootstrap();
