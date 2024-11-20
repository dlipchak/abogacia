$(document).ready(function () {
  const $reviewsContainer = $("#google-reviews");
  const $paginationContainer = $("#pagination-container");
  const reviewsPerPage = 12;
  let currentPage = 1;
  const totalPages = parseInt($("#total-pages").text(), 10);

  function showPage(page) {
    $reviewsContainer.children().hide();
    $reviewsContainer.children(`[data-page=${page}]`).show();
    $paginationContainer.find(".page-item").removeClass("active");
    $paginationContainer.find(`.page-link[data-page=${page}]`).parent().addClass("active");
    updatePaginationButtons(page);
  }
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

  function updatePaginationButtons(page) {
    $paginationContainer.find(".previous").toggleClass("disabled", page === 1);
    $paginationContainer.find(".next").toggleClass("disabled", page === totalPages);
  }

  $paginationContainer.on("click", ".page-link", function (e) {
    e.preventDefault();
    const newPage = parseInt($(this).data("page"));
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      showPage(currentPage);
      scrollToHeader();
    }
  });

  showPage(currentPage);
});
