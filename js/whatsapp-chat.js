/* Floating WhatsApp chat
 *
 * This component is intentionally isolated from js/main.js.
 * Remove this file and its two HTML include lines to remove the feature.
 */

(() => {
  const delay = 10000;
  const message = "How can I help?";
  const whatsappMessage = "Hello Jitesh, I visited your website and would like to connect.";
  const whatsappNumber = "918169272622";

  const createWidget = () => {
    const widget = document.createElement("div");
    widget.className = "jt-whatsapp-chat";
    widget.hidden = true;
    widget.setAttribute("aria-label", "WhatsApp contact");

    widget.innerHTML = `
      <button class="jt-whatsapp-chat__close" type="button" aria-label="Hide WhatsApp help" title="Hide WhatsApp help">×</button>
      <a
        class="jt-whatsapp-chat__bubble"
        href="#"
        aria-label="Open WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="jt-whatsapp-chat__message">${message}</span>
        <span class="jt-whatsapp-chat__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M5.5 6.5h13A2.5 2.5 0 0 1 21 9v6a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3.1A2.5 2.5 0 0 1 4 15V9a2.5 2.5 0 0 1 1.5-2.3" />
            <path d="M8 10.5h8M8 13.5h5" />
          </svg>
        </span>
      </a>
    `;

    document.body.appendChild(widget);
    return widget;
  };

  const showToast = () => {
    const toast = document.createElement("div");
    toast.className = "jt-whatsapp-chat__toast";
    toast.setAttribute("role", "status");
    toast.textContent = "WhatsApp help hidden. Refresh the page to show it again.";
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 280);
    }, 4200);
  };

  const openWhatsApp = (widget) => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    widget.remove();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const start = () => {
    const widget = createWidget();
    const closeButton = widget.querySelector(".jt-whatsapp-chat__close");
    const bubble = widget.querySelector(".jt-whatsapp-chat__bubble");

    const dismiss = () => {
      widget.remove();
      showToast();
    };

    closeButton.addEventListener("click", dismiss);

    bubble.addEventListener("click", (event) => {
      event.preventDefault();
      openWhatsApp(widget);
    });

    window.setTimeout(() => {
      widget.hidden = false;
      requestAnimationFrame(() => widget.classList.add("is-visible"));

      window.setTimeout(() => {
        if (!document.body.contains(widget)) return;
        widget.classList.add("is-collapsing");

        window.setTimeout(() => {
          if (document.body.contains(widget)) {
            widget.classList.remove("is-collapsing");
            widget.classList.add("is-collapsed");
          }
        }, 900);
      }, 3200);
    }, delay);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
