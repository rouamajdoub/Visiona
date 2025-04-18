import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaUser, FaArrowRight } from "react-icons/fa";
import Plant from "./img/plant-pot.png";
import Sofa from "./img/sofa.png";
import White from "./img/white.png";
import Chaire from "./img/chaire.png";
// Component-specific styles to avoid global CSS conflicts
import "./heroSlider.css"; // Create this file with the CSS below

const slides = [
  {
    id: 0,
    text: "Visiona is the go-to platform for elegant architecture and creative interior design. Discover curated projects that blend modern innovation with timeless style.",
  },
  {
    id: 1,
    text: "Our platform connects visionary clients with talented architects to create meaningful, sustainable, and personalized living spaces.",
  },
  {
    id: 2,
    text: "Explore an ecosystem where aesthetics meet function — from concepts to completion, Visiona empowers dream spaces.",
  },
];

const colors = ["#82B9BA", "#F5C069", "#C47EAA", "#9989D0"];

const HeroSlider = () => {
  const [active, setActive] = useState(1);
  const [hide, setHide] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const total = slides.length;
    setRotate(rotate + 100);
    setColorIndex(colorIndex + 1 >= colors.length ? 0 : colorIndex + 1);

    const newActive = active + 1 >= total ? 0 : active + 1;
    setActive(newActive);

    const newHide = active;
    setHide(newHide);

    // Re-enable button after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 1700);
  };

  const getItemClass = (index) => {
    if (index === active) return "vs_item vs_active";
    if (index === hide) return "vs_item vs_hide";
    return "vs_item";
  };

  return (
    <div className="vs_wrapper">
      <div className="vs_container">
        <div className="vs_background-rotate">
          <motion.div
            className="vs_bg-rotate"
            animate={{
              rotate: rotate,
              backgroundColor: colors[colorIndex],
            }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="vs_list">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className={getItemClass(index)}
              initial={{ opacity: index === 1 ? 1 : 0 }}
              animate={{
                opacity: index === active ? 1 : 0,
                transition: { duration: 0.5 },
              }}
            >
              <div className="vs_images">
                {/* First image circle */}
                <motion.div
                  className="vs_item_img"
                  animate={{
                    rotate: index === active ? 120 : index === hide ? 300 : -50,
                    filter: index === hide ? "blur(10px)" : "none",
                  }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  <motion.img
                    src={Sofa}
                    alt="Design element 1"
                    animate={{
                      rotate: index === active ? -108 : 0,
                    }}
                    transition={{ duration: 2 }}
                  />
                </motion.div>

                {/* Second image circle (main) */}
                <motion.div
                  className="vs_item_img vs_main-img"
                  animate={{
                    rotate: index === active ? 170 : index === hide ? 300 : -50,
                    filter: index === hide ? "blur(10px)" : "none",
                  }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{
                    "--background-rotate": `url(/api/placeholder/170/170)`,
                  }}
                >
                  <motion.img
                    src={Chaire}
                    alt="Main visual"
                    animate={{
                      rotate: index === active ? -188 : 0,
                    }}
                    transition={{ duration: 2 }}
                  />
                  <motion.div
                    className="vs_blur-effect"
                    animate={{
                      opacity: index === active ? 1 : 0,
                    }}
                    transition={{
                      duration: 1,
                      delay: index === active ? 1 : 0,
                    }}
                  />
                </motion.div>

                {/* Third image circle */}
                <motion.div
                  className="vs_item_img"
                  animate={{
                    rotate:
                      index === active ? 200 : index === hide ? 300 : -100,
                    filter: index === hide ? "blur(10px)" : "none",
                  }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  <motion.img
                    src={White}
                    alt="Design element 2"
                    className="vs_small-img"
                    animate={{
                      rotate: index === active ? -108 : 0,
                      x: index === active ? -130 : 0,
                    }}
                    transition={{ duration: 2 }}
                  />
                </motion.div>
              </div>

              <div className="vs_content">
                <motion.p
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: index === active ? 1 : 0,
                    x: index === active ? 0 : index === hide ? -100 : 100,
                  }}
                  transition={{ duration: 2 }}
                >
                  {slide.text}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="vs_menu">
          <ul>
            <li>
              <a href="/home">
                <FaHome />
              </a>
            </li>
            <li>
              <a href="/login">
                <FaUser />
              </a>
            </li>
            <li
              id="vs_next"
              onClick={handleNext}
              className={isAnimating ? "vs_disabled" : ""}
            >
              <FaArrowRight />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
