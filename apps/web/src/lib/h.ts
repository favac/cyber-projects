type CssClasses = string | readonly string[];
type StyleObject = Partial<CSSStyleDeclaration>;
type PrimitiveChild = Node | string | number | boolean | null | undefined;
type DomChild = PrimitiveChild | readonly DomChild[];

type EventHandler = (event: Event) => void;

export interface ElementProps<ElementType extends HTMLElement> extends Record<string, unknown> {
  readonly class?: CssClasses;
  readonly className?: CssClasses;
  readonly style?: string | StyleObject;
  readonly dataset?: Record<string, string>;
  readonly ref?: (element: ElementType) => void;
  readonly html?: string;
  readonly onClick?: EventHandler;
  readonly onChange?: EventHandler;
  readonly onInput?: EventHandler;
  readonly onSubmit?: EventHandler;
  readonly onKeydown?: EventHandler;
  readonly onKeyup?: EventHandler;
}

function applyClasses(target: HTMLElement, value: CssClasses | undefined): void {
  if (!value) {
    return;
  }
  if (typeof value === "string") {
    target.className = value;
    return;
  }
  if (Array.isArray(value)) {
    target.className = value.filter(Boolean).join(" ");
    return;
  }
}

function applyStyle(target: HTMLElement, value: string | StyleObject | undefined): void {
  if (!value) {
    return;
  }
  if (typeof value === "string") {
    target.setAttribute("style", value);
    return;
  }
  Object.assign(target.style, value);
}

function isDomChildArray(value: DomChild): value is readonly DomChild[] {
  return Array.isArray(value);
}

function appendChild(target: Node & ParentNode, child: DomChild): void {
  if (child == null || child === false) {
    return;
  }
  if (isDomChildArray(child)) {
    child.forEach((item) => appendChild(target, item));
    return;
  }
  if (child instanceof Node) {
    target.appendChild(child);
    return;
  }
  target.appendChild(document.createTextNode(String(child)));
}

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: ElementProps<HTMLElementTagNameMap[TagName]> = {},
  ...children: DomChild[]
): HTMLElementTagNameMap[TagName] {
  const element = document.createElement(tag);
  const { class: classProp, className, style, dataset, ref, html, ...rest } = props;
  applyClasses(element, classProp ?? className);
  applyStyle(element, style);
  if (dataset) {
    Object.assign(element.dataset, dataset);
  }
  if (typeof ref === "function") {
    ref(element);
  }
  if (typeof html === "string") {
    element.innerHTML = html;
  }
  for (const [key, value] of Object.entries(rest)) {
    if (value == null) {
      continue;
    }
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value as EventHandler);
      continue;
    }
    element.setAttribute(key, String(value));
  }
  children.forEach((child) => appendChild(element, child));
  return element;
}

export function fragment(...children: DomChild[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  children.forEach((child) => appendChild(frag, child));
  return frag;
}

export function mount(target: HTMLElement, node: Node): HTMLElement {
  target.replaceChildren(node);
  return target;
}

export function clear(target: HTMLElement): void {
  target.replaceChildren();
}

export const $ = <ElementType extends Element>(selector: string, root: ParentNode = document): ElementType | null => {
  return root.querySelector<ElementType>(selector);
};

export const $$ = <ElementType extends Element>(selector: string, root: ParentNode = document): ElementType[] => {
  return Array.from(root.querySelectorAll<ElementType>(selector));
};
