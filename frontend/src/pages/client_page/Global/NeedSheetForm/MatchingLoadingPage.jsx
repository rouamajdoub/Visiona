import React, { useState, useEffect } from "react";

const MatchingLoadingPage = ({
  onCancel,
  estimatedTime = 240, // 4 minutes in seconds
  projectTitle = "Your Project",
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingMessages = [
    "🔍 Analyzing your project requirements...",
    "🏗️ Searching through our architect database...",
    "🤖 Our AI is evaluating compatibility scores...",
    "📊 Calculating best matches based on expertise...",
    "🎯 Filtering architects by location and availability...",
    "✨ Almost there! Preparing your personalized matches...",
    "☕ Perfect time for that coffee break we mentioned!",
  ];

  const encouragingMessages = [
    "Finding the perfect architect takes time, but it's worth it!",
    "We're being thorough to ensure the best matches for you.",
    "Our AI is working hard to save you weeks of research.",
    "Quality matching requires patience - we're almost done!",
    "Great architecture starts with the right partnership.",
  ];

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cycle through messages
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 8000); // Change message every 8 seconds

    return () => clearInterval(messageTimer);
  }, [loadingMessages.length]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return Math.min((timeElapsed / estimatedTime) * 100, 95); // Cap at 95% until actual completion
  };

  const getRandomEncouragingMessage = () => {
    return encouragingMessages[
      Math.floor(Math.random() * encouragingMessages.length)
    ];
  };

  return (
    <>
      <style>{`
        .matching-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .matching-content {
          max-width: 32rem;
          width: 100%;
          text-align: center;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 12px 40px rgba(31, 38, 135, 0.37);
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .matching-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .matching-header {
          margin-bottom: 2rem;
        }

        .matching-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .matching-subtitle {
          font-size: 1rem;
          color: #4b5563;
          margin-bottom: 1.5rem;
        }

        .coffee-animation {
          width: 120px;
          height: 120px;
          margin: 1rem auto 2rem;
          position: relative;
        }

        .coffee-cup {
          width: 80px;
          height: 80px;
          background: #8B4513;
          border-radius: 0 0 40px 40px;
          position: relative;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .coffee-cup::before {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          background: #4A2C2A;
          border-radius: 50%;
          top: 10px;
          left: 10px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
        }

        .coffee-cup::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 30px;
          border: 4px solid #8B4513;
          border-left: none;
          border-radius: 0 10px 10px 0;
          right: -20px;
          top: 20px;
        }

        .coffee-steam {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
        }

        .steam-line {
          width: 3px;
          height: 20px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 3px;
          display: inline-block;
          margin: 0 2px;
          animation: steam 2s ease-in-out infinite;
        }

        .steam-line:nth-child(1) { animation-delay: 0s; }
        .steam-line:nth-child(2) { animation-delay: 0.3s; }
        .steam-line:nth-child(3) { animation-delay: 0.6s; }

        @keyframes steam {
          0%, 100% { opacity: 0.6; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(-10px) scale(1.1); }
        }

        .progress-section {
          margin: 2rem 0;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin: 1rem 0;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
          transition: width 1s ease-out;
          position: relative;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: progressShine 2s infinite;
        }

        @keyframes progressShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .current-message {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(5px);
          border-radius: 16px;
          padding: 1.5rem;
          margin: 2rem 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.5s ease-in-out;
        }

        .message-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .encouraging-text {
          font-size: 0.9rem;
          color: #6b7280;
          font-style: italic;
        }

        .timer-display {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(5px);
          border-radius: 12px;
          padding: 1rem;
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .timer-text {
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 0.25rem;
        }

        .timer-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          font-family: 'Courier New', monospace;
        }

        .action-buttons {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn-base {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          border: none;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(5px);
          color: #374151;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .loading-dots {
          display: inline-flex;
          gap: 4px;
          margin-left: 8px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #667eea;
          border-radius: 50%;
          animation: loadingDots 1.5s infinite ease-in-out;
        }

        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.3s; }
        .dot:nth-child(3) { animation-delay: 0.6s; }

        @keyframes loadingDots {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 2rem 0;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(5px);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          display: block;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        @media (max-width: 640px) {
          .matching-container {
            padding: 1rem;
          }
          
          .matching-content {
            padding: 2rem 1.5rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="matching-container">
        <div className="matching-content">
          <div className="matching-header">
            <h1 className="matching-title">Finding Your Perfect Match</h1>
            <p className="matching-subtitle">
              Our AI is analyzing {projectTitle} to find the best architects for
              you
            </p>
          </div>

          <div className="coffee-animation">
            <div className="coffee-steam">
              <div className="steam-line"></div>
              <div className="steam-line"></div>
              <div className="steam-line"></div>
            </div>
            <div className="coffee-cup"></div>
          </div>

          <div className="current-message">
            <div className="message-text">
              {loadingMessages[currentMessage]}
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
            <div className="encouraging-text">
              {getRandomEncouragingMessage()}
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(getProgressPercentage())}% Complete
            </div>
          </div>

          <div className="timer-display">
            <div className="timer-text">Time Elapsed</div>
            <div className="timer-value">{formatTime(timeElapsed)}</div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <div className="stat-label">Architects Analyzed</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <div className="stat-label">Criteria Checked</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">AI</span>
              <div className="stat-label">Powered Matching</div>
            </div>
          </div>

          <div className="action-buttons">
            {onCancel && (
              <button onClick={onCancel} className="btn-base btn-secondary">
                Cancel Matching
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchingLoadingPage;
