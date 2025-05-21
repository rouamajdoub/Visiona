"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead
import "./MarketS.css";
import img3 from "../../img/market/img3.jpg";
import img6 from "../../img/market/img6.jpg";
import img8 from "../../img/market/img8.jpg";

const MarketSection = () => {
  // Animation controls
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  const navigate = useNavigate(); // Initialize useNavigate

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

  const titleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };

  const handleClick = () => {
    navigate("/marketplace"); // Use navigate to go to the marketplace
  };

  return (
    <section className="market-section-container" ref={ref}>
      <motion.div
        className="market-section-content"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="market-section-text">
          <motion.h2 className="market-section-title" variants={titleVariants}>
            The Visiona Marketplace
          </motion.h2>

          <motion.p
            className="market-section-subtitle"
            variants={titleVariants}
          >
            Where design meets purpose. Crafted pieces from our architect
            community.
          </motion.p>

          <motion.button
            className="market-cta-btn"
            variants={titleVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick} // Add onClick handler
          >
            Explore Marketplace
          </motion.button>
        </div>

        <div className="market-section-images">
          {/* Primary 3D image */}
          <motion.div
            className="market-image-wrapper market-image-primary"
            variants={imageVariants}
            animate={floatingAnimation}
          >
            <div className="market-image-placeholder">
              <span>
                <img src={img3} alt="img3" />
              </span>
            </div>
          </motion.div>

          {/* Secondary 3D image */}
          <motion.div
            className="market-image-wrapper market-image-secondary"
            variants={imageVariants}
            animate={{
              ...floatingAnimation,
              transition: {
                ...floatingAnimation.transition,
                delay: 1.5,
              },
            }}
          >
            <div className="market-image-placeholder">
              <span>
                <img src={img6} alt="img6" />
              </span>
            </div>
          </motion.div>

          {/* Tertiary 3D image */}
          <motion.div
            className="market-image-wrapper market-image-tertiary"
            variants={imageVariants}
            animate={{
              ...floatingAnimation,
              transition: {
                ...floatingAnimation.transition,
                delay: 3,
              },
            }}
          >
            <div className="market-image-placeholder">
              <span>
                <img src={img8} alt="img8" />
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default MarketSection;
