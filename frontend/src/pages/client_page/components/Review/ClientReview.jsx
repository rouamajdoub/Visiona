import React, { useState } from "react";
import { Star, Send } from "lucide-react";

const ClientReview = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredValue) => {
    setHoveredRating(hoveredValue);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    console.log("Submitted review:", { rating, comment });
    setIsSubmitted(true);

    setTimeout(() => {
      setRating(0);
      setComment("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section className="review-section">
      <style>{`
        .review-section {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4ff 0%, #e6eeff 100%);
          padding: 64px 16px;
          font-family: 'Inter', sans-serif;
        }

        .review-container-wrapper {
          position: relative;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .decorative-element-left {
          position: absolute;
          left: -100px;
          top: 50%;
          transform: translateY(-50%);
          width: 160px;
          height: 160px;
          background: linear-gradient(135deg, #4d7bf3 0%, #835df7 50%, #a78bfa 100%);
          border-radius: 0 30px 0 30px;
          transform: rotate(12deg);
          opacity: 0.8;
          filter: blur(8px);
        }

        .decorative-element-right {
          position: absolute;
          right: -64px;
          bottom: 0;
          width: 180px;
          height: 180px;
          background: linear-gradient(135deg, #4d7bf3 0%, #38bdf8 50%, #818cf8 100%);
          border-radius: 50%;
          transform: rotate(45deg);
          opacity: 0.7;
          filter: blur(8px);
        }

        @media (max-width: 1200px) {
          .decorative-element-left, .decorative-element-right {
            display: none;
          }
        }

        .review-container {
          background-color: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          position: relative;
          z-index: 10;
        }

        .success-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #34d399 0%, #3b82f6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .success-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .success-title {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(to right, #3b82f6, #4f46e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .success-text {
          color: #4b5563;
          margin-top: 8px;
          font-size: 18px;
        }

        .review-content {
          padding: 32px 48px;
        }

        .review-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .review-title {
          font-size: 36px;
          font-weight: bold;
          background: linear-gradient(to right, #1e40af, #3730a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
        }

        .review-subtitle {
          color: #4b5563;
          max-width: 600px;
          margin: 0 auto;
          font-size: 18px;
          line-height: 1.5;
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .rating-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .rating-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .stars-container {
          display: flex;
          gap: 12px;
        }

        .star-button {
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.3s ease;
          padding: 4px;
        }

        .star-button:hover {
          transform: scale(1.1);
        }

        .star-icon {
          width: 38px;
          height: 38px;
        }

        .star-icon.filled, .star-icon.hovered {
          color: #3b82f6;
          filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
        }

        .star-icon.unfilled {
          color: #d1d5db;
        }

        .rating-text {
          height: 32px;
          margin-top: 8px;
          color: #3b82f6;
          font-weight: 500;
          font-size: 16px;
        }

        .comment-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comment-label {
          font-size: 18px;
          font-weight: 500;
          color: #1f2937;
        }

        .comment-textarea {
          width: 100%;
          height: 128px;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #bfdbfe;
          background-color: rgba(255, 255, 255, 0.7);
          color: #374151;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          resize: none;
          transition: all 0.3s ease;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .comment-textarea::placeholder {
          color: #9ca3af;
        }

        .submit-container {
          display: flex;
          justify-content: center;
          padding-top: 16px;
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 32px;
          background: linear-gradient(to right, #3b82f6, #4f46e5);
          color: white;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .submit-button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .learn-more-container {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .learn-more-link {
          color: #3b82f6;
          font-weight: 500;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }

        .learn-more-link:hover {
          color: #1d4ed8;
        }

        .learn-more-icon {
          width: 20px;
          height: 20px;
          margin-left: 4px;
        }
        
        @media (max-width: 640px) {
          .review-content {
            padding: 24px;
          }
          
          .review-title {
            font-size: 28px;
          }
          
          .review-subtitle {
            font-size: 16px;
          }
          
          .star-icon {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>

      <div className="review-container-wrapper">
        {/* Decorative Elements */}
        <div className="decorative-element-left"></div>
        <div className="decorative-element-right"></div>

        <div className="review-container">
          {isSubmitted ? (
            <div className="success-message">
              <div className="success-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="success-title">Thank You!</h3>
              <p className="success-text">
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            <div className="review-content">
              <div className="review-header">
                <h2 className="review-title">Join the Visiona Community</h2>
                <p className="review-subtitle">
                  With Visiona, managing projects, clients, and designs has
                  never been easier. Share your experience with us.
                </p>
              </div>

              <div className="review-form">
                <div className="rating-container">
                  <h3 className="rating-title">
                    How would you rate your experience?
                  </h3>
                  <div className="stars-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="star-button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => handleRatingHover(star)}
                        onMouseLeave={handleRatingLeave}
                        aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`star-icon ${
                            rating >= star
                              ? "filled"
                              : hoveredRating >= star
                              ? "hovered"
                              : "unfilled"
                          }`}
                          fill={
                            rating >= star || hoveredRating >= star
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <div className="rating-text">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </div>
                </div>

                <div className="comment-container">
                  <label htmlFor="comment" className="comment-label">
                    Share your thoughts
                  </label>
                  <textarea
                    id="comment"
                    className="comment-textarea"
                    placeholder="Tell us about your experience with Visiona..."
                    value={comment}
                    onChange={handleCommentChange}
                  ></textarea>
                </div>

                <div className="submit-container">
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className="submit-button"
                  >
                    Submit Review
                    <Send size={18} />
                  </button>
                </div>
              </div>

              <div className="learn-more-container">
                <a href="#" className="learn-more-link">
                  Learn more
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="learn-more-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClientReview;
