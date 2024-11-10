$(document).ready(function () {
    const $reviewsContainer = $('#google-reviews');

    if ($reviewsContainer.length) {
        const reviewsData = JSON.parse($('#reviews-json').text());

        // Helper function to convert "Hace" times to a comparable date
        const parseRelativeTime = (timeString) => {
            const now = new Date();
            const yearsMatch = timeString.match(/(\d+|un) año/);
            const monthsMatch = timeString.match(/(\d+|un) mes/);
            const weeksMatch = timeString.match(/(\d+|una?) semana/);
            const daysMatch = timeString.match(/(\d+|una?) día/);

            if (yearsMatch) {
                const yearsAgo = yearsMatch[1] === 'un' ? 1 : parseInt(yearsMatch[1]);
                return new Date(now.setFullYear(now.getFullYear() - yearsAgo));
            }
            if (monthsMatch) {
                const monthsAgo = monthsMatch[1] === 'un' ? 1 : parseInt(monthsMatch[1]);
                return new Date(now.setMonth(now.getMonth() - monthsAgo));
            }
            if (weeksMatch) {
                const weeksAgo = weeksMatch[1] === 'una' ? 1 : parseInt(weeksMatch[1]);
                return new Date(now.setDate(now.getDate() - weeksAgo * 7));
            }
            if (daysMatch) {
                const daysAgo = daysMatch[1] === 'una' ? 1 : parseInt(daysMatch[1]);
                return new Date(now.setDate(now.getDate() - daysAgo));
            }
            return now;
        };

        // Sort reviews by parsed `reviewTime` from newest to oldest
        reviewsData.sort((a, b) => parseRelativeTime(b.reviewTime) - parseRelativeTime(a.reviewTime));

        // Calculate the overall rating and reviews count
        const totalReviews = reviewsData.length;
        const averageRating = (
            reviewsData.reduce((sum, review) => {
                const ratingMatch = review.rating.match(/(\d+(\.\d+)?)/);
                return sum + (ratingMatch ? parseFloat(ratingMatch[0]) : 0);
            }, 0) / totalReviews
        ).toFixed(1);

        // Generate the stars based on the average rating
        const fullStars = '★'.repeat(Math.floor(averageRating));
        const emptyStars = '☆'.repeat(5 - Math.floor(averageRating));
        const starsHtml = fullStars + emptyStars;

        const headerHtml = `
            <div class="review-header">
                <img src="images/google-logo.svg" alt="Google Logo" class="google-logo">
                <div class="review-summary">
                    <span class="rating">${averageRating}</span>
                    <span class="stars">${starsHtml}</span>
                    <span class="reviews-count">(${totalReviews} opiniones)</span>
                </div>
            </div>
        `;
        $reviewsContainer.before(headerHtml);

        // Render sorted reviews
        reviewsData.forEach(function (review) {
            const ratingMatch = review.rating.match(/(\d+(\.\d+)?)/);
            const rating = ratingMatch ? Math.round(parseFloat(ratingMatch[0])) : 0;

            const reviewHtml = `
                <div class="oc-item">
                    <div class="entry">
                        <div class="entry-header">
                            <div class="entry-image">
                                <img src="${review.imageUrl}" alt="${review.reviewerName}" class="review-avatar">
                            </div>
                            <div class="entry-title">${review.reviewerName}</div>
                        </div>
                        <div class="review-info">
                            <div class="review-rating">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
                            <div class="review-date">${review.reviewTime}</div>
                        </div>
                        <div class="entry-content">
                            <p>${review.reviewText ? review.reviewText : ''}</p>
                        </div>
                    </div>
                </div>
            `;
            $reviewsContainer.append(reviewHtml);
        });

        // $reviewsContainer.owlCarousel({
        //     items: 1,
        //     loop: true,
        //     margin: 20,
        //     stagePadding: 70,
        //     dots:true,
        //     responsive: {
        //         0: {
        //             items: 1,
        //             stagePadding: 70
        //         },
        //         600: {
        //             items: 1.5,
        //             stagePadding: 100
        //         },
        //         1000: {
        //             items: 2,
        //             stagePadding: 120
        //         }
        //     }
        // });
    }
});
