/**
 * WhatsApp Chat Widget
 * - Toggles popup on floating button click
 * - Auto-opens on first visit (24h cookie)
 * - Hides gotoTop button when popup is open
 */

// Show WhatsApp button when fonts are ready (with fallback)
function showWhatsAppButton() {
  var toggle = document.querySelector(".whatsapp-toggle");
  if (toggle) {
    toggle.classList.add("loaded");
  }
}

// Try to show button when fonts are ready
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(showWhatsAppButton).catch(showWhatsAppButton);
} else {
  // Fallback if document.fonts is not available
  showWhatsAppButton();
}

// Additional fallback: show button after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showWhatsAppButton);
} else {
  // DOM is already ready
  setTimeout(showWhatsAppButton, 100);
}

// WhatsApp Widget - runs immediately
(function () {
  var popup = document.getElementById("whatsappPopup");
  var toggle = document.querySelector(".whatsapp-toggle");
  var closeBtn = document.querySelector(".whatsapp-close");
  var gotoTop = document.getElementById("gotoTop");

  if (!toggle || !popup) return;

  // Helper to show/hide gotoTop
  function updateGotoTop(popupOpen) {
    if (gotoTop) {
      gotoTop.style.opacity = popupOpen ? "0" : "";
      gotoTop.style.visibility = popupOpen ? "hidden" : "";
      gotoTop.style.pointerEvents = popupOpen ? "none" : "";
    }
  }

  // Cookie helpers
  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }

  function setCookie(name, value, hours) {
    var expires = new Date();
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
    document.cookie =
      name +
      "=" +
      value +
      ";expires=" +
      expires.toUTCString() +
      ";path=/;SameSite=Lax";
  }

  // Auto-open popup on first visit (24h cookie)
  var COOKIE_NAME = "whatsapp_popup_shown";
  if (!getCookie(COOKIE_NAME)) {
    // Hide gotoTop immediately since popup will open
    updateGotoTop(true);

    // Wait for button to be visible, then open popup
    setTimeout(function () {
      popup.classList.add("active");
      toggle.classList.add("active");
      setCookie(COOKIE_NAME, "1", 24);

      if (typeof gtag === "function") {
        gtag("event", "whatsapp_widget_auto_open", {
          event_category: "contact",
          event_label: "first_visit",
        });
      }
    }, 1500); // 1.5 second delay
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpening = !popup.classList.contains("active");
    popup.classList.toggle("active");
    toggle.classList.toggle("active");
    updateGotoTop(isOpening);

    if (isOpening && typeof gtag === "function") {
      gtag("event", "whatsapp_widget_open", {
        event_category: "contact",
        event_label: "floating_widget",
      });
    }
  });

  closeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    popup.classList.remove("active");
    toggle.classList.remove("active");
    updateGotoTop(false);
  });

  document.addEventListener("click", function (e) {
    var widget = document.querySelector(".whatsapp-widget");
    if (widget && !widget.contains(e.target)) {
      popup.classList.remove("active");
      toggle.classList.remove("active");
      updateGotoTop(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && popup.classList.contains("active")) {
      popup.classList.remove("active");
      toggle.classList.remove("active");
      updateGotoTop(false);
    }
  });
})();
