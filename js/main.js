const currentYear = document.querySelector("#current-year");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#primary-navigation");
const siteHeader = document.querySelector(".site-header");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (siteHeader) {
  const compactAt = 48;
  const expandedAt = 12;
  let isCompact = siteHeader.classList.contains("is-scrolled");
  let scrollFrame = null;

  const updateHeaderState = () => {
    const scrollY = window.scrollY;

    if (!isCompact && scrollY > compactAt) {
      isCompact = true;
      siteHeader.classList.add("is-scrolled");
    } else if (isCompact && scrollY < expandedAt) {
      isCompact = false;
      siteHeader.classList.remove("is-scrolled");
    }
  };

  const handleScroll = () => {
    if (scrollFrame !== null) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      updateHeaderState();
      scrollFrame = null;
    });
  };

  updateHeaderState();
  window.addEventListener("scroll", handleScroll, { passive: true });
}

if (menuToggle && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

    if (isOpen) {
      const firstLink = siteNav.querySelector("a");
      firstLink?.focus();
    }
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.classList.contains("is-open")) {
      return;
    }

    const target = event.target;

    if (target instanceof Node && !siteNav.contains(target) && !menuToggle.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 48rem)").matches) {
      closeMenu();
    }
  });
}


const contactStatus = document.querySelector("#contact-status");

if (contactStatus) {
  const status = new URLSearchParams(window.location.search).get("status");

  if (status === "success") {
    contactStatus.textContent = "Thanks — your message has been sent.";
    contactStatus.hidden = false;
  } else if (status === "error") {
    contactStatus.textContent = "The message could not be sent. Please try email instead.";
    contactStatus.hidden = false;
  }
}
