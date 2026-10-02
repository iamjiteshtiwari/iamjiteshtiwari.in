const currentYear = document.querySelector("#current-year");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#primary-navigation");
const siteHeader = document.querySelector(".site-header");

// Keep the Thoughts menu consistent across every page.
document.querySelectorAll(".site-nav").forEach((nav) => {
  const thoughtsLink = nav.querySelector('a[href="/thoughts/"]');
  if (thoughtsLink && !thoughtsLink.closest(".site-nav__dropdown")) {
    const wrapper = document.createElement("div");
    wrapper.className = "site-nav__dropdown";
    const button = document.createElement("button");
    button.className = "site-nav__dropdown-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-haspopup", "true");
    button.innerHTML = 'Thoughts <span class="site-nav__dropdown-icon" aria-hidden="true">▾</span>';
    const menu = document.createElement("div");
    menu.className = "site-nav__dropdown-menu";
    const about = document.createElement("a");
    about.href = "/thoughts/";
    about.textContent = "About Thoughts";
    const blogs = document.createElement("a");
    blogs.href = "/thoughts/blogs/";
    blogs.textContent = "My Blogs";
    menu.append(about, blogs);
    wrapper.append(button, menu);
    thoughtsLink.replaceWith(wrapper);
  }
});

const thoughtsDropdowns = document.querySelectorAll(".site-nav__dropdown");
thoughtsDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".site-nav__dropdown-toggle");
  if (!toggle) return;
  const setDropdownState = (isOpen) => {
    dropdown.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) toggle.blur();
  };

  setDropdownState(false);

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = !dropdown.classList.contains("is-open");
    setDropdownState(isOpen);
  });
  dropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setDropdownState(false);
    });
  });
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) return;
  thoughtsDropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      const toggle = dropdown.querySelector(".site-nav__dropdown-toggle");
      dropdown.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  thoughtsDropdowns.forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    const toggle = dropdown.querySelector(".site-nav__dropdown-toggle");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (siteHeader) {
  const compactAt = 80;
  const expandedAt = 24;
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
    if (scrollFrame !== null) return;
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
    if (isOpen) siteNav.querySelector("a")?.focus();
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.classList.contains("is-open")) return;
    const target = event.target;
    if (target instanceof Node && !siteNav.contains(target) && !menuToggle.contains(target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 48rem)").matches) closeMenu();
  });
}


/**
 * Contact form
 *
 * Uses URL-encoded form data so the browser does not need a CORS preflight.
 */
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const contactSubmit = document.querySelector("#contact-submit");

if (contactForm && contactStatus) {
  const showContactStatus = (message, type) => {
    contactStatus.textContent = message;
    contactStatus.dataset.status = type;
    contactStatus.hidden = false;
  };

  const setContactBusy = (busy) => {
    if (contactSubmit) {
      contactSubmit.disabled = busy;
      contactSubmit.textContent = busy ? "Sending…" : "Send message";
    }
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const captchaResponse = typeof grecaptcha !== "undefined"
      ? grecaptcha.getResponse()
      : "";

    if (!captchaResponse) {
      showContactStatus("Please complete the reCAPTCHA verification.", "error");
      return;
    }

    setContactBusy(true);
    showContactStatus("Sending your message…", "sending");

    try {
      const formData = new FormData(contactForm);
      const body = new URLSearchParams(formData);

      const response = await fetch(contactForm.action, {
        method: "POST",
        body
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const data = await response.json();

      if (data.success === true) {
        showContactStatus(
          "Your message has been sent successfully. Thank you for reaching out.",
          "success"
        );
        contactForm.reset();
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
        console.info("Contact form submitted successfully.");
      } else if (data.message === "Please complete the reCAPTCHA verification.") {
        showContactStatus("Please complete the reCAPTCHA verification.", "error");
      } else if (data.message === "Too many submissions. Please try again later.") {
        showContactStatus("Too many submissions. Please try again later.", "error");
      } else if (
        data.message === "Please complete all required fields." ||
        data.message === "Please enter a valid email address." ||
        data.message === "Please enter a valid mobile number."
      ) {
        showContactStatus("Please check the information you entered and try again.", "error");
      } else {
        console.error("Contact form API error:", data);
        showContactStatus(
          "We could not send your message right now. Please try again later or use the email option above.",
          "error"
        );
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      }
    } catch (error) {
      console.error("Contact form request failed:", error);
      showContactStatus(
        "We could not connect to the contact service. Please try again later or use the email option above.",
        "error"
      );
      if (typeof grecaptcha !== "undefined") grecaptcha.reset();
    } finally {
      setContactBusy(false);
    }
  });
}


/**
 * Global site search
 *
 * Searches the site's page content on the client side so the website
 * remains fully static and GitHub Pages compatible.
 */
const searchButton = document.querySelector(".search-toggle");

if (searchButton) {
  const searchablePages = [
    { url: "/", label: "Home" },
    { url: "/about/", label: "About" },
    { url: "/professional/", label: "Professional" },
    { url: "/projects/", label: "Projects" },
    { url: "/thoughts/", label: "Thoughts" },
    { url: "/thoughts/blogs/", label: "My Blogs" },
    { url: "/stories/", label: "Stories" },
    { url: "/interests/", label: "Interests" },
    { url: "/capabilities/", label: "Capabilities" },
    { url: "/current-status/", label: "Current status" },
    { url: "/contact/", label: "Contact" }
  ];

  let searchOverlay = null;
  let searchInput = null;
  let searchResults = null;
  let searchIndex = null;

  const normalizeText = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();

  const createSearchOverlay = () => {
    if (searchOverlay) return;
    searchOverlay = document.createElement("div");
    searchOverlay.className = "search-overlay";
    searchOverlay.hidden = true;
    searchOverlay.innerHTML = `
      <div class="search-overlay__backdrop" data-search-close></div>
      <section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div class="search-panel__box">
          <span class="search-panel__icon" aria-hidden="true">⌕</span>
          <h2 id="search-title" class="visually-hidden">Search this website</h2>
          <input class="search-input" type="search" autocomplete="off" spellcheck="false"
            placeholder="Search anything..." aria-label="Search this website" aria-controls="search-results">
          <button class="search-close" type="button" aria-label="Close search">×</button>
        </div>
        <div class="search-results" id="search-results" aria-live="polite"></div>
      </section>
    `;
    document.body.appendChild(searchOverlay);
    searchInput = searchOverlay.querySelector(".search-input");
    searchResults = searchOverlay.querySelector(".search-results");
  };

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));

  const renderResults = (items, query, loading = false) => {
    if (!searchResults) return;
    if (loading) {
      searchResults.innerHTML = '<p class="search-results__hint">Loading search…</p>';
      return;
    }
    if (!query) {
      searchResults.innerHTML = '<p class="search-results__hint">Search across pages, projects, skills, work, thoughts, stories and interests.</p>';
      return;
    }
    if (!items.length) {
      searchResults.innerHTML = `<p class="search-results__empty">No results found for “${escapeHtml(query)}”.</p>`;
      return;
    }
    searchResults.innerHTML = items.slice(0, 8).map((item) => `
      <a class="search-result" href="${item.url}">
        <span class="search-result__label">${escapeHtml(item.label)}</span>
        <strong class="search-result__title">${escapeHtml(item.title)}</strong>
        <span class="search-result__snippet">${escapeHtml(item.snippet)}</span>
      </a>
    `).join("");
  };

  const buildSearchIndex = async () => {
    if (searchIndex) return searchIndex;
    const pages = await Promise.all(searchablePages.map(async (page) => {
      try {
        const response = await fetch(page.url, { headers: { Accept: "text/html" } });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, "text/html");
        const main = parsed.querySelector("main");
        const title = parsed.querySelector("title")?.textContent?.trim() || page.label;
        const text = main?.textContent?.replace(/\s+/g, " ").trim() || "";
        return { url: page.url, label: page.label, title, text, normalized: normalizeText(title + " " + text) };
      } catch (error) {
        console.warn("Search index could not load:", page.url, error);
        return null;
      }
    }));
    searchIndex = pages.filter(Boolean);
    return searchIndex;
  };

  const getSnippet = (item, query) => {
    const source = item.text || item.title;
    const position = source.toLowerCase().indexOf(query.toLowerCase());
    const start = Math.max(0, (position >= 0 ? position : 0) - 70);
    const snippet = source.slice(start, start + 180).trim();
    return (start > 0 ? "…" : "") + snippet + (start + 180 < source.length ? "…" : "");
  };

  const performSearch = async (value) => {
    const query = normalizeText(value);
    if (!query) {
      renderResults([], "");
      return;
    }
    if (!searchIndex) {
      renderResults([], query, true);
      await buildSearchIndex();
    }

    const terms = query.split(" ").filter(Boolean);
    const results = searchIndex.map((item) => {
      const score = terms.reduce((total, term) => {
        return total
          + (normalizeText(item.title).includes(term) ? 8 : 0)
          + (normalizeText(item.label).includes(term) ? 5 : 0)
          + (item.normalized.includes(term) ? 1 : 0);
      }, 0);
      return { ...item, score, snippet: getSnippet(item, query) };
    })
    .filter((item) => item.score >= terms.length)
    .sort((a, b) => b.score - a.score);

    renderResults(results, query);
  };

  const closeSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.hidden = true;
    document.body.classList.remove("search-is-open");
    searchButton.focus();
  };

  const openSearch = () => {
    createSearchOverlay();
    searchOverlay.hidden = false;
    document.body.classList.add("search-is-open");
    renderResults([], "");
    searchInput.value = "";
    searchInput.focus();
    buildSearchIndex();
  };

  searchButton.addEventListener("click", openSearch);

  document.addEventListener("click", (event) => {
    if (!searchOverlay || searchOverlay.hidden || !(event.target instanceof Element)) return;
    if (event.target.closest("[data-search-close], .search-close")) closeSearch();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchOverlay && !searchOverlay.hidden) closeSearch();
  });

  document.addEventListener("input", (event) => {
    if (event.target === searchInput) performSearch(event.target.value);
  });
}
