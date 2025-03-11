document.addEventListener("DOMContentLoaded", () => {
  const reviewsContainer = document.getElementById("google-reviews");
  const paginationContainer = document.getElementById("pagination-container");
  const totalPages = parseInt(
    document.getElementById("total-pages").textContent,
    10
  );
  let currentPage = 1;

  function showPage(page) {
    // Hide all reviews
    reviewsContainer.querySelectorAll("[data-page]").forEach((el) => {
      el.style.display = "none";
    });

    // Show reviews for the chosen page
    reviewsContainer.querySelectorAll(`[data-page="${page}"]`).forEach((el) => {
      el.style.display = "";
    });

    // Remove 'active' from all page links
    paginationContainer.querySelectorAll(".page-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Mark the new page # as active
    const pageLink = paginationContainer.querySelector(
      `.page-link[data-page="${page}"]`
    );
    if (pageLink) {
      pageLink.closest(".page-item").classList.add("active");
    }

    // Update disabled/enabled states
    updatePaginationButtons(page);
  }

  function updatePaginationButtons(page) {
    const prevItem = paginationContainer.querySelector(".page-item.previous");
    const nextItem = paginationContainer.querySelector(".page-item.next");

    // Disable 'previous' if on page 1
    if (prevItem) {
      prevItem.classList.toggle("disabled", page === 1);
    }

    // Disable 'next' if on last page
    if (nextItem) {
      nextItem.classList.toggle("disabled", page === totalPages);
    }
  }

  // Scroll back up to the review header so user sees the top
  function scrollToHeader() {
    const headerElement = document.getElementById("review-header");
    if (!headerElement) return;
    const headerHeight = headerElement.offsetHeight;
    const headerPosition =
      headerElement.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: headerPosition,
      behavior: "instant",
    });
  }

  // Handle pagination clicks
  paginationContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".page-item");
    if (!item) return; // clicked outside any <li>

    e.preventDefault();

    // If user clicked “Previous” arrow
    if (
      item.classList.contains("previous") &&
      !item.classList.contains("disabled")
    ) {
      currentPage = Math.max(currentPage - 1, 1);
      showPage(currentPage);
      scrollToHeader();
      return;
    }

    // If user clicked “Next” arrow
    if (
      item.classList.contains("next") &&
      !item.classList.contains("disabled")
    ) {
      currentPage = Math.min(currentPage + 1, totalPages);
      showPage(currentPage);
      scrollToHeader();
      return;
    }

    // If user clicked a specific page number
    const link = item.querySelector(".page-link[data-page]");
    if (link) {
      const newPage = parseInt(link.dataset.page, 10);
      if (!isNaN(newPage)) {
        currentPage = newPage;
        showPage(currentPage);
        scrollToHeader();
      }
    }
  });

  // Show the first page by default
  showPage(currentPage);
});
