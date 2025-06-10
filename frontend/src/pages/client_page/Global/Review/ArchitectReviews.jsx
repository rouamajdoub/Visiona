import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjectReviews,
  createProjectReview,
  selectProjectReviews,
  selectReviewsLoading,
  selectReviewsError,
  selectReviewsSuccess,
  resetReviewState,
} from "../../../../redux/slices/reviewsSlice";
import "./ArchitectReviews.css";

const ArchitectReviews = ({ architectId, architectName }) => {
  const dispatch = useDispatch();
  const reviews = useSelector(selectProjectReviews);
  const isLoading = useSelector(selectReviewsLoading);
  const error = useSelector(selectReviewsError);
  const success = useSelector(selectReviewsSuccess);

  // State management
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    recommendToOthers: true,
  });
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    if (architectId) {
      dispatch(getProjectReviews(architectId));
    }
  }, [dispatch, architectId]);

  useEffect(() => {
    if (success) {
      setShowReviewForm(false);
      setReviewData({
        rating: 5,
        title: "",
        comment: "",
        recommendToOthers: true,
      });
      dispatch(resetReviewState());
    }
  }, [success, dispatch]);

  const handleSubmitReview = () => {
    if (reviewData.comment.trim() && reviewData.title.trim()) {
      dispatch(
        createProjectReview({
          projectId: architectId,
          reviewData,
        })
      );
    }
  };

  const handleInputChange = (name, value) => {
    setReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate statistics
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    stars: rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((review) => review.rating === rating).length /
            reviews.length) *
          100
        : 0,
  }));

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(
      (review) =>
        filterRating === "all" || review.rating === parseInt(filterRating)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className={`stars ${interactive ? "interactive" : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : ""}`}
            onClick={
              interactive && onStarClick ? () => onStarClick(star) : undefined
            }
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="architect-reviews">
      <div className="reviews-header">
        <h2>Reviews for {architectName}</h2>
        <button
          className="write-review-btn"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          Write a Review
        </button>
      </div>

      {/* Review Summary */}
      {reviews.length > 0 && (
        <div className="reviews-summary">
          <div className="rating-overview">
            <div className="average-rating">
              <span className="rating-number">{averageRating}</span>
              <div className="rating-stars">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="review-count">{reviews.length} reviews</span>
            </div>

            <div className="rating-breakdown">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="rating-bar">
                  <span className="star-label">{stars} ★</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="review-form-container">
          <div className="review-form">
            <h3>Write Your Review</h3>

            <div className="form-group">
              <label>Rating</label>
              {renderStars(reviewData.rating, true, (rating) =>
                handleInputChange("rating", rating)
              )}
            </div>

            <div className="form-group">
              <label>Review Title</label>
              <input
                type="text"
                value={reviewData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Summarize your experience..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Your Review</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                placeholder="Tell others about your experience working with this architect..."
                rows="5"
                className="form-textarea"
              />
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={reviewData.recommendToOthers}
                  onChange={(e) =>
                    handleInputChange("recommendToOthers", e.target.checked)
                  }
                  className="checkbox-input"
                />
                <span className="checkbox-label">
                  I would recommend this architect to others
                </span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmitReview}
                disabled={
                  isLoading ||
                  !reviewData.comment.trim() ||
                  !reviewData.title.trim()
                }
              >
                {isLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Filters */}
      {reviews.length > 0 && (
        <div className="reviews-filters">
          <div className="sort-filter">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>

          <div className="rating-filter">
            <label>Filter by rating:</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {isLoading && <div className="loading">Loading reviews...</div>}

        {!isLoading && reviews.length === 0 && (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this architect!</p>
          </div>
        )}

        {filteredAndSortedReviews.map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.user?.name?.charAt(0) || "U"}
                </div>
                <div className="reviewer-details">
                  <h4 className="reviewer-name">
                    {review.user?.name || "Anonymous User"}
                  </h4>
                  <span className="review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
              <div className="review-rating">{renderStars(review.rating)}</div>
            </div>

            <div className="review-content">
              <h5 className="review-title">{review.title}</h5>
              <p className="review-text">{review.comment}</p>

              {review.recommendToOthers && (
                <div className="recommendation">
                  <span className="recommend-badge">✓ Recommends</span>
                </div>
              )}
            </div>

            <div className="review-actions">
              <button className="helpful-btn">👍 Helpful</button>
              <button className="reply-btn">💬 Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchitectReviews;
