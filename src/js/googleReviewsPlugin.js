document.addEventListener('DOMContentLoaded', () => {
  const reviewsContainer = document.getElementById('google-reviews');
  const paginationContainer = document.getElementById('pagination-container');
  const reviewsPerPage = 12;
  let currentPage = 1;
  const totalPages = parseInt(document.getElementById('total-pages').textContent, 10);

  function showPage(page) {
    // Hide all reviews
    reviewsContainer.querySelectorAll('[data-page]').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show reviews for current page
    reviewsContainer.querySelectorAll(`[data-page="${page}"]`).forEach(el => {
      el.style.display = '';
    });
    
    // Update pagination active state
    paginationContainer.querySelectorAll('.page-item').forEach(el => {
      el.classList.remove('active');
    });
    
    const activePageLink = paginationContainer.querySelector(`.page-link[data-page="${page}"]`);
    if (activePageLink) {
      activePageLink.closest('.page-item').classList.add('active');
    }
    
    updatePaginationButtons(page);
  }

  function scrollToHeader() {
    const headerElement = document.getElementById('review-header');
    const headerHeight = headerElement.offsetHeight;
    const headerPosition = headerElement.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: headerPosition,
      behavior: 'instant'
    });
  }

  function updatePaginationButtons(page) {
    const previousButton = paginationContainer.querySelector('.previous');
    const nextButton = paginationContainer.querySelector('.next');
    
    if (previousButton) {
      previousButton.classList.toggle('disabled', page === 1);
    }
    
    if (nextButton) {
      nextButton.classList.toggle('disabled', page === totalPages);
    }
  }

  // Event delegation for pagination clicks
  paginationContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('page-link')) {
      e.preventDefault();
      const newPage = parseInt(e.target.dataset.page, 10);
      
      if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        showPage(currentPage);
        scrollToHeader();
      }
    }
  });

  // Show initial page
  showPage(currentPage);
});
