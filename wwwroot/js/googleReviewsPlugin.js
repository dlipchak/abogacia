$(document).ready(function () {
  const $reviewsContainer = $("#google-reviews");
  const $paginationContainer = $("#pagination-container");
  const reviewsData = JSON.parse($("#reviews-json").text());
  const reviewsPerPage = 12;
  let currentPage = 1;
  const totalPages = Math.ceil(reviewsData.length / reviewsPerPage);

  // Helper function to convert "Hace" times to a comparable date
  const parseRelativeTime = (timeString) => {
    const now = new Date();
    const yearsMatch = timeString.match(/(\d+|un) año/);
    const monthsMatch = timeString.match(/(\d+|un) mes/);
    const weeksMatch = timeString.match(/(\d+|una?) semana/);
    const daysMatch = timeString.match(/(\d+|una?) día/);

    if (yearsMatch) {
      const yearsAgo = yearsMatch[1] === "un" ? 1 : parseInt(yearsMatch[1]);
      return new Date(now.setFullYear(now.getFullYear() - yearsAgo));
    }
    if (monthsMatch) {
      const monthsAgo = monthsMatch[1] === "un" ? 1 : parseInt(monthsMatch[1]);
      return new Date(now.setMonth(now.getMonth() - monthsAgo));
    }
    if (weeksMatch) {
      const weeksAgo = weeksMatch[1] === "una" ? 1 : parseInt(weeksMatch[1]);
      return new Date(now.setDate(now.getDate() - weeksAgo * 7));
    }
    if (daysMatch) {
      const daysAgo = daysMatch[1] === "una" ? 1 : parseInt(daysMatch[1]);
      return new Date(now.setDate(now.getDate() - daysAgo));
    }
    return now;
  };

  // Sort reviews by parsed `reviewTime` from newest to oldest
  reviewsData.sort(
    (a, b) => parseRelativeTime(b.reviewTime) - parseRelativeTime(a.reviewTime)
  );

  // Calculate the overall rating and reviews count
  const totalReviews = reviewsData.length;
  const averageRating = (
    reviewsData.reduce((sum, review) => {
      const ratingMatch = review.rating.match(/(\d+(\.\d+)?)/);
      return sum + (ratingMatch ? parseFloat(ratingMatch[0]) : 0);
    }, 0) / totalReviews
  ).toFixed(1);

  // Generate the stars based on the average rating
  const fullStars = "★".repeat(Math.floor(averageRating));
  const emptyStars = "☆".repeat(5 - Math.floor(averageRating));
  const starsHtml = fullStars + emptyStars;

  // Header HTML for Google reviews summary
  const headerHtml = `
    <div class="review-header" id="review-header">
        <div class="google-logo"></div> <!-- Logo as a background image in CSS -->
        <div class="review-summary">
            <span class="rating">${averageRating}</span>
            <span class="stars">${starsHtml}</span>
            <span class="reviews-count">(${totalReviews} opiniones)</span>
        </div>
    </div>
    `;

  $reviewsContainer.before(headerHtml); // Insert header before reviews container

  // Function to scroll to the top of the header with an offset
  function scrollToHeader() {
    const headerElement = document.getElementById("review-header");
    const headerHeight = headerElement.offsetHeight;

    // Calculate the position to scroll to based on the height of the header
    const headerPosition =
      headerElement.getBoundingClientRect().top + window.scrollY - headerHeight;

    // Scroll to the calculated position to display the entire header at the top
    window.scrollTo({
      top: headerPosition,
      behavior: "instant",
    });
  }

  // Display reviews
  function displayReviews(page) {
    $reviewsContainer.hide(); // Hide the container during content update
    $reviewsContainer.empty(); // Clear previous reviews
    const start = (page - 1) * reviewsPerPage;
    const end = start + reviewsPerPage;
    const reviewsToShow = reviewsData.slice(start, end);

    reviewsToShow.forEach(function (review) {
      const ratingMatch = review.rating.match(/(\d+(\.\d+)?)/);
      const rating = ratingMatch ? Math.round(parseFloat(ratingMatch[0])) : 0;

      const reviewHtml = `
                <div class="review-card">
                    <div class="entry">
                        <div class="entry-header">
                            <div class="entry-image">
                                <img src="${review.imageUrl}" alt="${
        review.reviewerName
      }" class="review-avatar">
                            </div>
                            <div class="entry-title">${
                              review.reviewerName
                            }</div>
                        </div>
                        <div class="review-info">
                            <div class="review-rating">${"★".repeat(
                              rating
                            )}${"☆".repeat(5 - rating)}</div>
                            <div class="review-date">${review.reviewTime}</div>
                        </div>
                        <div class="entry-content">
                            <p>${review.reviewText || ""}</p>
                        </div>
                    </div>
                </div>
            `;
      $reviewsContainer.append(reviewHtml);
    });

    $reviewsContainer.show(); // Show the container after content update
  }

  // Generate Spanish pagination links with ellipses
  function updatePagination() {
    $paginationContainer.empty();

    // Create the UL element for pagination if it doesn't exist
    const $paginationList = $("<ul>", {
      class:
        "pagination pagination-rounded pagination-inside-transparent pagination-button",
    }).appendTo($paginationContainer);

    // Check viewport width to adjust number of visible page numbers
    const isSmallViewport = window.innerWidth <= 576; // Adjust threshold as needed
    const maxVisiblePages = isSmallViewport ? 3 : 5;

    // Previous Button with only icon
    $paginationList.append(`
        <li class="page-item previous${currentPage === 1 ? " disabled" : ""}">
            <a class="page-link" href="#" data-page="${
              currentPage - 1
            }" aria-disabled="${currentPage === 1}" aria-label="Anterior">
                <span aria-hidden="true">«</span>
            </a>
        </li>
    `);

    // Page Numbers with Ellipses
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      totalPages,
      currentPage + Math.floor(maxVisiblePages / 2)
    );

    if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage > totalPages - Math.ceil(maxVisiblePages / 2)) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      $paginationList.append(`
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
            ${
              startPage > 2
                ? '<li class="page-item disabled"><span class="page-link">...</span></li>'
                : ""
            }
        `);
    }

    for (let i = startPage; i <= endPage; i++) {
      $paginationList.append(`
            <li class="page-item${i === currentPage ? " active" : ""}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }

    if (endPage < totalPages) {
      $paginationList.append(`
            ${
              endPage < totalPages - 1
                ? '<li class="page-item disabled"><span class="page-link">...</span></li>'
                : ""
            }
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `);
    }

    // Next Button with only icon
    $paginationList.append(`
        <li class="page-item next${
          currentPage === totalPages ? " disabled" : ""
        }">
            <a class="page-link" href="#" data-page="${
              currentPage + 1
            }" aria-disabled="${currentPage === totalPages}" aria-label="Siguiente">
                <span aria-hidden="true">»</span>
            </a>
        </li>
    `);
  }

  // Handle pagination click events
  $paginationContainer.on("click", ".page-link", function (e) {
    e.preventDefault();
    const newPage = parseInt($(this).data("page"));
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      displayReviews(currentPage);
      updatePagination();
      scrollToHeader(); // Instantly scroll to the header after displaying reviews
    }
  });

  // Initial display
  displayReviews(currentPage);
  updatePagination();
});
