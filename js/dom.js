export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? "" : value);
  });

  appendChildren(node, children);
  return node;
}

export function appendChildren(node, children) {
  children.flat(Infinity).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
}

export function replaceContent(node, ...children) {
  node.replaceChildren();
  appendChildren(node, children);
}
