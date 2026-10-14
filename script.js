"use strict";

const year = document.querySelector("#year");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));

if (year) {
  year.textContent = String(new Date().getFullYear());
}

let lenis = null;
let lenisFrame = 0;

const animateSmoothScroll = (time) => {
  if (!lenis) {
    return;
  }

  lenis.raf(time);
  lenisFrame = window.requestAnimationFrame(animateSmoothScroll);
};

const syncSmoothScroll = () => {
  if (reducedMotion.matches) {
    window.cancelAnimationFrame(lenisFrame);
    lenis?.destroy();
    lenis = null;
    lenisFrame = 0;
    return;
  }

  if (lenis || typeof window.Lenis !== "function") {
    return;
  }

  lenis = new window.Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
  });

  lenisFrame = window.requestAnimationFrame(animateSmoothScroll);
};

syncSmoothScroll();

const heroLink = document.querySelector(".hero-link");

heroLink?.addEventListener("click", (event) => {
  if (!lenis) {
    return;
  }

  const target = document.querySelector(heroLink.hash);

  if (!target) {
    return;
  }

  event.preventDefault();
  lenis.scrollTo(target);
});

const textRevealElements = revealElements.filter((element) => (
  element.dataset.reveal === "words" || element.dataset.reveal === "lines"
));

const wrapTextNode = (textNode) => {
  const fragment = document.createDocumentFragment();
  const parts = textNode.textContent.split(/(\s+)/u);

  for (const part of parts) {
    if (!part) {
      continue;
    }

    if (/^\s+$/u.test(part)) {
      fragment.append(document.createTextNode(part));
      continue;
    }

    const mask = document.createElement("span");
    const word = document.createElement("span");
    mask.className = "reveal-token";
    word.className = "reveal-token__inner";
    word.textContent = part;
    mask.append(word);
    fragment.append(mask);
  }

  textNode.replaceWith(fragment);
};

const splitText = (element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) {
      textNodes.push(walker.currentNode);
    }
  }

  textNodes.forEach(wrapTextNode);
};

const setRevealDelays = (element) => {
  const tokens = Array.from(element.querySelectorAll(".reveal-token"));

  if (element.dataset.reveal === "words") {
    tokens.forEach((token, index) => {
      token.style.setProperty("--reveal-delay", `${Math.min(index * 48, 720)}ms`);
    });
    return;
  }

  let line = -1;
  let previousTop = null;

  tokens.forEach((token) => {
    const currentTop = Math.round(token.offsetTop);

    if (previousTop === null || Math.abs(currentTop - previousTop) > 2) {
      line += 1;
      previousTop = currentTop;
    }

    token.style.setProperty("--reveal-delay", `${Math.min(line * 90, 450)}ms`);
  });
};

textRevealElements.forEach(splitText);
textRevealElements.forEach(setRevealDelays);

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealOnce = (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  };

  const revealObserver = new IntersectionObserver(revealOnce, {
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.12,
  });

  const centeredRevealObserver = new IntersectionObserver(revealOnce, {
    rootMargin: "0px 0px -52% 0px",
    threshold: 0.01,
  });

  revealElements.forEach((element) => {
    const observer = element.dataset.revealStart === "center"
      ? centeredRevealObserver
      : revealObserver;
    observer.observe(element);
  });
}

document.documentElement.classList.add("motion-ready");

let resizeFrame = 0;

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => {
    textRevealElements
      .filter((element) => element.dataset.reveal === "lines" && !element.classList.contains("is-visible"))
      .forEach(setRevealDelays);
  });
}, { passive: true });

if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    textRevealElements
      .filter((element) => !element.classList.contains("is-visible"))
      .forEach(setRevealDelays);
  });
}

reducedMotion.addEventListener("change", () => {
  syncSmoothScroll();

  if (reducedMotion.matches) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }
});
