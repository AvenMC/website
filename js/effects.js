const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((node) => node.classList.add("isVisible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("isVisible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  targets.forEach((node) => observer.observe(node));
}

export function initSpotlight() {
  if (prefersReducedMotion) return;
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(".hasSpotlight");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouseX", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouseY", `${event.clientY - rect.top}px`);
  });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }
}

export function initTilt() {
  if (prefersReducedMotion) return;
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(".hasTilt");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tiltX", `${(-y * 6).toFixed(2)}deg`);
    card.style.setProperty("--tiltY", `${(x * 6).toFixed(2)}deg`);
  });
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest?.(".hasTilt");
    if (!card || card.contains(event.relatedTarget)) return;
    card.style.removeProperty("--tiltX");
    card.style.removeProperty("--tiltY");
  });
}

// Fades one fixed backdrop to each section's tone as it crosses the middle of the viewport.
export function initSectionTone(entries) {
  document.querySelector(".pageBackdrop")?.remove();
  const backdrop = document.createElement("div");
  backdrop.className = "pageBackdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.style.setProperty("--tone", entries[0][1]);
  document.body.prepend(backdrop);

  const tones = new Map(entries);
  const observer = new IntersectionObserver(
    (items) => {
      items.forEach((item) => {
        if (item.isIntersecting) backdrop.style.setProperty("--tone", tones.get(item.target));
      });
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  entries.forEach(([section]) => observer.observe(section));
}
