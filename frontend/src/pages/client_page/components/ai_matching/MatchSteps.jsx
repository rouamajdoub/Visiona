import React from "react";
import {
  ArrowRight,
  Lightbulb,
  Cpu,
  HandshakeIcon,
  Rocket,
} from "lucide-react";

// CSS for the component - all styles in one file as requested
const styles = `
  .match-section {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
  }

  .match-section-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .match-section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #0B65ED, #4393fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .match-section-description {
    font-size: 1.1rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .match-steps-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 3rem 0;
  }

  .step-card {
    height: 480px;
    background-color: white;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .step-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }

  .step-card-figure {
    height: 280px;
    background-color: #f0f5fa;
    padding: 1rem;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .step-card:hover .step-card-figure {
    height: 250px;
  }

  .step-card-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(123.9deg, #0B65ED 1.52%, rgba(0, 0, 0, 0) 68.91%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .step-card:hover .step-card-gradient {
    opacity: 0.7;
  }

  .step-card-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(11, 101, 237, 0.2);
    z-index: 2;
    transition: all 0.3s ease;
  }

  .step-card:hover .step-card-icon {
    transform: translate(-50%, -60%);
  }

  .step-card-icon svg {
    width: 50px;
    height: 50px;
    color: #0B65ED;
  }

  .step-card-content {
    padding: 1.5rem;
  }

  .step-number {
    height: 2rem;
    width: 5rem;
    background-color: #4393fc;
    border-radius: 6px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem;
    color: #333;
  }

  .step-description {
    font-size: 1rem;
    color: #666;
    line-height: 1.5;
  }

  .step-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #0B65ED;
    font-weight: 500;
    margin-top: 1rem;
    text-decoration: none;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
  }

  .step-card:hover .step-link {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-button {
    display: block;
    width: max-content;
    margin: 2rem auto 0;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #0B65ED, #4393fc);
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
  }

  .cta-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(11, 101, 237, 0.3);
  }

  @media (max-width: 768px) {
    .match-section-title {
      font-size: 2rem;
    }
    
    .match-steps-container {
      grid-template-columns: 1fr;
    }
    
    .step-card {
      height: auto;
      min-height: 450px;
    }
  }
`;

const MatchSteps = () => {
  const steps = [
    {
      number: "Step 1",
      title: "Define Your Vision",
      description:
        "Tell us about your property, your goals, and the kind of help you need — no detail is too small.",
      icon: <Lightbulb />,
    },
    {
      number: "Step 2",
      title: "Let AI Do the Work",
      description:
        "Our smart algorithm analyzes your needs and preferences to find the most relevant architect for your project.",
      icon: <Cpu />,
    },
    {
      number: "Step 3",
      title: "Meet Your Perfect Match",
      description:
        "Get introduced to an architect who matches your criteria — view their portfolio and client reviews.",
      icon: <HandshakeIcon />,
    },
    {
      number: "Step 4",
      title: "Start Your Journey",
      description:
        "Collaborate, communicate, and watch your project come to life with expert guidance every step of the way.",
      icon: <Rocket />,
    },
  ];

  return (
    <section className="match-section">
      <style>{styles}</style>

      <div className="match-section-header">
        <h2>From Vision to Reality: Let AI Guide You</h2>
        <p>
          Whether you're building, renovating, or just imagining — our
          intelligent matching system uses your answers to connect you with the
          right expert. It's fast, simple, and made for you.
        </p>
      </div>

      <div className="match-steps-container">
        {steps.map((step, index) => (
          <div className="step-card" key={index}>
            <figure className="step-card-figure">
              <div className="step-card-gradient"></div>
              <div className="step-card-icon">{step.icon}</div>
            </figure>
            <div className="step-card-content">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              <a href="#" className="step-link">
                Learn more <ArrowRight size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <a href="/needsheet" className="cta-button">
        Start Your Journey Now
      </a>
    </section>
  );
};

export default MatchSteps;
