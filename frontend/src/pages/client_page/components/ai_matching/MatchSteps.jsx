"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./match-steps.css";

const MatchSteps = () => {
  // Animation controls
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Trigger animations when section comes into view
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Step data
  const steps = [
    {
      number: 1,
      title: "Define Your Vision",
      description:
        "Tell us about your property, your goals, and the kind of help you need — no detail is too small. We'll guide you with simple questions to clarify your style, space, and priorities.",
      icon: "✏️",
    },
    {
      number: 2,
      title: "Let AI Do the Work",
      description:
        "Our intelligent algorithm analyzes your needs, preferences, and design intent to shortlist the best architects for your unique project. No guesswork. Just precision.",
      icon: "🧠",
    },
    {
      number: 3,
      title: "Meet Your Perfect Match",
      description:
        "Instantly get connected with a curated architect. Explore their portfolio, read verified client reviews, and choose with confidence.",
      icon: "🤝",
    },
    {
      number: 4,
      title: "Start Your Journey",
      description:
        "Collaborate directly on our platform with your selected architect. Message, plan, and see your dream space take shape — backed by expert guidance.",
      icon: "🚀",
    },
  ];

  return (
    <section className="visiona-match-steps-container" ref={ref}>
      <div className="visiona-match-steps-content">
        <motion.div
          className="visiona-match-steps-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="visiona-match-steps-title">
            How Our AI Matching Works
          </h2>
          <p className="visiona-match-steps-subtitle">
            A seamless journey from vision to reality, powered by intelligent
            design matching
          </p>
        </motion.div>

        <motion.div
          className="visiona-match-steps-list"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="visiona-match-steps-item"
              variants={itemVariants}
            >
              <div className="visiona-match-steps-item-content">
                <div className="visiona-match-steps-number-container">
                  <span className="visiona-match-steps-number">
                    {step.number}
                  </span>
                </div>

                <div className="visiona-match-steps-details">
                  <h3 className="visiona-match-steps-item-title">
                    {step.title}
                  </h3>
                  <p className="visiona-match-steps-item-description">
                    {step.description}
                  </p>
                </div>

                <div className="visiona-match-steps-icon-container">
                  <div className="visiona-match-steps-icon">{step.icon}</div>
                </div>
              </div>

              {step.number < steps.length && (
                <div className="visiona-match-steps-connector">
                  <div className="visiona-match-steps-connector-line"></div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="visiona-match-steps-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <a href="/needsheet" className="visiona-match-steps-cta-button">
            Start Your Journey Now
          </a>
        </motion.div>
      </div>

      <div className="visiona-match-steps-background-element"></div>
    </section>
  );
};

export default MatchSteps;
