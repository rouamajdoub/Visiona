import React, { useState } from "react";
import { FaHome, FaUser, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import "./heroSlider.css";

// Import your images
import Sofa from "./img/sofa.png";
import furniture from "./img/furniture.png";
import paint from "./img/Paint.png";

const slides = [
  {
    id: 0,
    text: "Visiona is the go-to platform for elegant architecture and creative interior design. Discover curated projects that blend modern innovation with timeless style.",
  },
  {
    id: 1,
    text: "What sets Visiona apart is its commitment to craftsmanship and attention to detail. Each project is carefully curated using premium materials to ensure durability and longevity. Whether you're looking for a statement piece or subtle accents, Visiona has something for everyone.",
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
  const [imageSet, setImageSet] = useState([Sofa, furniture, paint]);

  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const total = slides.length;
    setRotate(rotate + 100);
    setColorIndex((colorIndex + 1) % colors.length);

    const newActive = (active + 1) % total;
    const newHide = active;

    // Rotate images forward
    setImageSet((prev) => {
      const newOrder = [...prev.slice(1), prev[0]];
      return newOrder;
    });

    setActive(newActive);
    setHide(newHide);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1700);
  };

  const handlePrev = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const total = slides.length;
    setRotate(rotate - 100);
    setColorIndex((colorIndex - 1 + colors.length) % colors.length);

    const newActive = (active - 1 + total) % total;
    const newHide = active;

    // Rotate images backward
    setImageSet((prev) => {
      const newOrder = [
        prev[prev.length - 1],
        ...prev.slice(0, prev.length - 1),
      ];
      return newOrder;
    });

    setActive(newActive);
    setHide(newHide);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1700);
  };

  return (
    <div className="abt_wrapper">
      <div className="abt_container">
        <div className="abt_background-rotate">
          <div
            className="abt_bg-rotate"
            style={{
              transform: `rotate(${rotate}deg)`,
              backgroundColor: colors[colorIndex],
              transition: "1s",
            }}
          />
        </div>

        <div className="abt_list">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`abt_item ${index === active ? "active" : ""} ${
                index === hide ? "hide" : ""
              }`}
            >
              <div className="abt_images">
                {imageSet.map((img, idx) => (
                  <div className="abt_item_img" key={idx}>
                    <img src={img} alt={`Design element ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <div className="abt_content">
                <p>{slide.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="abt_menu">
          <ul>
            <li>
              <a href="http://localhost:3001/">
                <FaHome />
              </a>
            </li>
            <li>
              <a href="login">
                <FaUser />
              </a>
            </li>
            <li
              id="prev"
              onClick={handlePrev}
              style={{ pointerEvents: isAnimating ? "none" : "unset" }}
            >
              <FaArrowLeft />
            </li>
            <li
              id="next"
              onClick={handleNext}
              style={{ pointerEvents: isAnimating ? "none" : "unset" }}
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
