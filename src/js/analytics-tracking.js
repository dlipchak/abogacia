/**
 * Comprehensive Google Analytics Tracking
 * Tracks user interactions across the entire site
 */

document.addEventListener("DOMContentLoaded", () => {
  // Only run if gtag is available
  if (typeof gtag !== "function") {
    console.log("Google Analytics not loaded - tracking disabled");
    return;
  }

  // =============================================
  // 1. EMAIL LINK CLICKS
  // =============================================
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", () => {
      const email = link.href.replace("mailto:", "");
      gtag("event", "email_click", {
        event_category: "contact",
        event_label: email,
        link_location: getLinkLocation(link),
      });
    });
  });

  // =============================================
  // 2. PHONE NUMBER CLICKS
  // =============================================
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener("click", () => {
      const phone = link.href.replace("tel:", "");
      gtag("event", "phone_click", {
        event_category: "contact",
        event_label: phone,
        link_location: getLinkLocation(link),
      });
    });
  });

  // =============================================
  // 3. SOCIAL MEDIA CLICKS
  // =============================================
  const socialPatterns = [
    { pattern: /facebook\.com/i, name: "facebook" },
    { pattern: /instagram\.com/i, name: "instagram" },
    { pattern: /twitter\.com|x\.com/i, name: "twitter" },
    { pattern: /linkedin\.com/i, name: "linkedin" },
    { pattern: /youtube\.com/i, name: "youtube" },
  ];

  document.querySelectorAll('a[href*="facebook"], a[href*="instagram"]').forEach((link) => {
    link.addEventListener("click", () => {
      const social = socialPatterns.find((s) => s.pattern.test(link.href));
      if (social) {
        gtag("event", "social_click", {
          event_category: "social",
          event_label: social.name,
          link_location: getLinkLocation(link),
          link_url: link.href,
        });
      }
    });
  });

  // =============================================
  // 4. FAQ ACCORDION INTERACTIONS
  // =============================================
  document.querySelectorAll(".toggle.faq .toggle-header, .toggle.faq .toggle-title").forEach((header) => {
    header.addEventListener("click", () => {
      const toggle = header.closest(".toggle.faq");
      const question = toggle?.querySelector(".toggle-title")?.textContent?.trim() || "Unknown";
      const isOpening = !toggle?.classList.contains("toggle-active");

      gtag("event", "faq_interaction", {
        event_category: "engagement",
        event_label: question.substring(0, 100), // Limit length
        action: isOpening ? "expand" : "collapse",
        page_path: window.location.pathname,
      });
    });
  });

  // =============================================
  // 5. NAVIGATION MENU CLICKS
  // =============================================
  document.querySelectorAll(".primary-menu .menu-link").forEach((link) => {
    link.addEventListener("click", () => {
      const menuText = link.textContent?.trim() || "Unknown";
      const href = link.getAttribute("href") || "#";

      // Only track actual navigation, not parent menu items
      if (href !== "#") {
        gtag("event", "navigation_click", {
          event_category: "navigation",
          event_label: menuText,
          link_url: href,
        });
      }
    });
  });

  // =============================================
  // 6. OUTBOUND LINK CLICKS
  // =============================================
  document.querySelectorAll("a[target='_blank']").forEach((link) => {
    // Skip already tracked links (social, whatsapp)
    if (
      link.href.includes("whatsapp") ||
      link.href.includes("facebook") ||
      link.href.includes("instagram")
    ) {
      return;
    }

    link.addEventListener("click", () => {
      gtag("event", "outbound_click", {
        event_category: "outbound",
        event_label: new URL(link.href).hostname,
        link_url: link.href,
        link_text: link.textContent?.trim()?.substring(0, 50) || "No text",
      });
    });
  });

  // =============================================
  // 7. MAP/LOCATION CLICKS
  // =============================================
  document.querySelectorAll('a[href*="google.com/maps"]').forEach((link) => {
    link.addEventListener("click", () => {
      gtag("event", "map_click", {
        event_category: "contact",
        event_label: "google_maps",
        link_location: getLinkLocation(link),
      });
    });
  });

  // =============================================
  // 8. SCROLL DEPTH TRACKING
  // =============================================
  const scrollDepths = [25, 50, 75, 90, 100];
  const trackedDepths = new Set();

  function getScrollPercent() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 100;
    return Math.round((window.scrollY / docHeight) * 100);
  }

  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const percent = getScrollPercent();

      scrollDepths.forEach((depth) => {
        if (percent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          gtag("event", "scroll_depth", {
            event_category: "engagement",
            event_label: `${depth}%`,
            scroll_depth: depth,
            page_path: window.location.pathname,
          });
        }
      });
    }, 100);
  });

  // =============================================
  // 9. TIME ON PAGE TRACKING
  // =============================================
  const pageLoadTime = Date.now();
  const timeThresholds = [30, 60, 120, 300]; // seconds
  const trackedTimes = new Set();

  setInterval(() => {
    const secondsOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);

    timeThresholds.forEach((threshold) => {
      if (secondsOnPage >= threshold && !trackedTimes.has(threshold)) {
        trackedTimes.add(threshold);
        gtag("event", "time_on_page", {
          event_category: "engagement",
          event_label: `${threshold}s`,
          time_seconds: threshold,
          page_path: window.location.pathname,
        });
      }
    });
  }, 5000);

  // =============================================
  // 10. BLOG ARTICLE ENGAGEMENT
  // =============================================
  const articleContent = document.querySelector(".entry-content, .blog-entry, article");
  if (articleContent) {
    // Track article read start
    gtag("event", "article_view", {
      event_category: "content",
      event_label: document.title,
      page_path: window.location.pathname,
    });

    // Track if user scrolls to end of article
    const articleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gtag("event", "article_read_complete", {
              event_category: "content",
              event_label: document.title,
              page_path: window.location.pathname,
            });
            articleObserver.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe the last element in article or the article end
    const articleEnd =
      articleContent.querySelector(".entry-meta:last-of-type") ||
      articleContent.lastElementChild;
    if (articleEnd) {
      articleObserver.observe(articleEnd);
    }
  }

  // =============================================
  // 11. CALCULATOR PAGE VIEWS
  // =============================================
  if (window.location.pathname.includes("calculadora")) {
    gtag("event", "calculator_view", {
      event_category: "calculator",
      event_label: window.location.pathname,
      page_title: document.title,
    });
  }

  // =============================================
  // 12. LOGO CLICK (HOME NAVIGATION)
  // =============================================
  document.querySelectorAll("#logo a, .footer-logo").forEach((logo) => {
    logo.addEventListener("click", () => {
      gtag("event", "logo_click", {
        event_category: "navigation",
        event_label: getLinkLocation(logo),
      });
    });
  });

  // =============================================
  // 13. CTA BUTTON CLICKS
  // =============================================
  document.querySelectorAll(".button, .btn-primary, [class*='cta']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const btnText = btn.textContent?.trim()?.substring(0, 50) || "Unknown";
      gtag("event", "cta_click", {
        event_category: "engagement",
        event_label: btnText,
        page_path: window.location.pathname,
      });
    });
  });

  // =============================================
  // 14. COPY TEXT (if users copy content)
  // =============================================
  document.addEventListener("copy", () => {
    const selectedText = window.getSelection()?.toString()?.substring(0, 100) || "";
    if (selectedText.length > 10) {
      gtag("event", "text_copy", {
        event_category: "engagement",
        event_label: selectedText,
        page_path: window.location.pathname,
      });
    }
  });

  // =============================================
  // 15. PRINT PAGE
  // =============================================
  window.addEventListener("beforeprint", () => {
    gtag("event", "page_print", {
      event_category: "engagement",
      event_label: document.title,
      page_path: window.location.pathname,
    });
  });

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  function getLinkLocation(element) {
    if (element.closest("header")) return "header";
    if (element.closest("footer")) return "footer";
    if (element.closest(".sidebar")) return "sidebar";
    if (element.closest("nav")) return "navigation";
    if (element.closest("article")) return "article";
    return "content";
  }
});

// =============================================
// 16. PAGE VISIBILITY (Tab switches)
// =============================================
let hiddenTime = null;
document.addEventListener("visibilitychange", () => {
  if (typeof gtag !== "function") return;

  if (document.hidden) {
    hiddenTime = Date.now();
  } else if (hiddenTime) {
    const hiddenDuration = Math.floor((Date.now() - hiddenTime) / 1000);
    if (hiddenDuration > 5) {
      gtag("event", "page_return", {
        event_category: "engagement",
        event_label: `after_${hiddenDuration}s`,
        hidden_seconds: hiddenDuration,
        page_path: window.location.pathname,
      });
    }
    hiddenTime = null;
  }
});

// =============================================
// 17. PAGE EXIT INTENT (Desktop only)
// =============================================
let exitIntentTracked = false;
document.addEventListener("mouseout", (e) => {
  if (typeof gtag !== "function") return;

  if (
    !exitIntentTracked &&
    e.clientY < 10 &&
    e.relatedTarget === null
  ) {
    exitIntentTracked = true;
    gtag("event", "exit_intent", {
      event_category: "engagement",
      page_path: window.location.pathname,
      time_on_page: Math.floor((Date.now() - performance.timing.navigationStart) / 1000),
    });
  }
});


