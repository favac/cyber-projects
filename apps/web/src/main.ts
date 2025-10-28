import "./styles/para.css";
import { clear, h, mount } from "./lib/h.ts";
import { createPersistentStore } from "./stores/persistent-store.ts";
import { createAreaModal, type AreaFormData } from "./components/area-modal.ts";
import { createLoginModal } from "./components/login-modal.ts";
import { createRegisterModal } from "./components/register-modal.ts";
import { isAuthenticated, logout, getCurrentUser } from "./lib/api.ts";

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

const projectCards: readonly ProjectCardData[] = [
  {
    id: "website-redesign",
    title: "Website Redesign",
    dueLabel: "Due: 25 Dec",
    status: "in-progress",
  },
  {
    id: "marketing-plan",
    title: "Q4 Marketing Plan",
    dueLabel: "Due: 15 Nov",
    status: "on-hold",
  },
  {
    id: "feature-launch",
    title: "New Feature Launch",
    dueLabel: "Due: 01 Feb",
    status: "completed",
  },
];

const projectStatusClassMap: Record<ProjectStatus, string> = {
  "in-progress": "para-tag para-tag--in-progress",
  "on-hold": "para-tag para-tag--on-hold",
  completed: "para-tag para-tag--completed",
};

const areaCards: readonly AreaCardData[] = [
  { id: "health", label: "Health & Fitness", summary: "12 notes", icon: "fitness_center" },
  {
    id: "development",
    label: "Prof. Development",
    summary: "34 resources",
    icon: "school",
  },
  { id: "home", label: "Home Management", summary: "5 tasks", icon: "home" },
  { id: "finance", label: "Finance", summary: "8 docs", icon: "account_balance_wallet" },
];

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
    h("div", { class: "para-nav__brand-icon" }, materialIcon("design_services")),
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
              store.update({ ...store.get(), isAuthenticated: false, userName: "" });
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
    h(
      "div",
      { class: "para-topbar__actions" },
      ...authActions
    )
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

function createProjectsSection(): HTMLElement {
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "CURRENT PROJECTS"),
      h("a", { class: "para-section__link", href: "#" }, "VIEW ALL")
    ),
    h(
      "div",
      { class: "para-card-grid para-card-grid--projects" },
      projectCards.map((card) => createProjectCard(card))
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

function createAreasSection(): HTMLElement {
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "AREAS OF FOCUS"),
      h("a", { class: "para-section__link", href: "#" }, "VIEW ALL")
    ),
    h(
      "div",
      { class: "para-card-grid para-card-grid--areas" },
      areaCards.map((card) => createAreaCard(card))
    )
  );
}

function createResourceCard(card: ResourceCardData): HTMLElement {
  return h(
    "article",
    { class: "para-card para-card--resource" },
    h(
      "div",
      { class: "para-card__media", style: { backgroundImage: card.image, aspectRatio: card.aspectRatio } }
    ),
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
      h("a", { class: "para-section__link", href: "#" }, materialIcon("add"), "QUICK SAVE")
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
    h(
      "div",
      { class: "para-card__media", style: { backgroundImage: card.image, aspectRatio: card.aspectRatio } }
    ),
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

function createArchiveSection(): HTMLElement {
  return h(
    "section",
    { class: "para-section" },
    h(
      "div",
      { class: "para-section__header" },
      h("h2", { class: "para-section__title" }, "ARCHIVED VISUALS"),
      h("a", { class: "para-section__link", href: "#" }, materialIcon("search"), "BROWSE ALL")
    ),
    h(
      "div",
      { class: "para-masonry" },
      archiveCards.map((card) => createArchiveCard(card))
    )
  );
}

function renderSections(): HTMLElement {
  return h(
    "div",
    { class: "para-sections" },
    createProjectsSection(),
    createAreasSection(),
    createResourcesSection(),
    createArchiveSection()
  );
}


function renderLayout(state: AppState): HTMLElement {
  const handleCloseModal = (): void => {
    store.update({ ...store.get(), isModalOpen: false });
  };

  const handleSubmitArea = (data: AreaFormData): void => {
    // eslint-disable-next-line no-console
    console.log("Creating area:", data);
  };

  const handleAuthSuccess = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      store.update({
        ...store.get(),
        isAuthenticated: true,
        userName: user.displayName,
        isLoginModalOpen: false,
        isRegisterModalOpen: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get user:", error);
    }
  };

  const areaModal = createAreaModal({
    isOpen: state.isModalOpen,
    onClose: handleCloseModal,
    onSubmit: handleSubmitArea,
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
      h("main", { class: "para-main" }, renderTopbar(state), renderSections())
    );
    if (areaModal) {
      children.push(areaModal);
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
  
  return h("div", { class: "para-app" }, ...children);
}

async function initializeAuth(): Promise<void> {
  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser();
      store.update({
        ...store.get(),
        isAuthenticated: true,
        userName: user.displayName,
        isLoginModalOpen: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to validate token:", error);
      logout();
      store.update({
        ...store.get(),
        isAuthenticated: false,
        userName: "",
        isLoginModalOpen: true,
      });
    }
  }
}

function bootstrap(): void {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) {
    // eslint-disable-next-line no-console
    console.error("Root element #app not found.");
    return;
  }
  clear(root);
  mount(root, renderLayout(store.get()));
  store.subscribe((state) => {
    mount(root, renderLayout(state));
  });
  void initializeAuth();
}

bootstrap();
