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
