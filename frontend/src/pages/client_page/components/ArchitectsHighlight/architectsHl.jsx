import React, { useRef } from "react";
import architect from "../../img/architect3d.png";
import Paint from "../../img/Paint.png";
import furniture from "../../img/furniture.png";
import { Search, Users } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const ArchitectsHighlight = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Create transform effects for the floating images
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section ref={sectionRef} className="architects-highlight-section">
      <style>{`
        .architects-highlight-section {
          padding: 5rem 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(to bottom, white, #ebf1ff); 
          max-width: 2900px;
          position: relative;
          overflow-x: clip;
        }

        .architects-card {
          width: 100%;
          max-width: 980px;
          position: relative;
          border: 1px solid transparent;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(45deg, #080b11, #1e293b 50%, #172033) padding-box,
                      conic-gradient(from var(--border-angle), rgba(148, 163, 184, 0.48) 80%, #4f46e5 86%, #818cf8 90%, #4f46e5 94%, rgba(148, 163, 184, 0.48)) border-box;
          --border-angle: 0turn;
          animation: border-rotate 8s linear infinite;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes border-rotate {
          to {
            --border-angle: 1turn;
          }
        }

        .architects-card-content {
          position: relative;
          z-index: 10;
          padding: 4rem 2rem;
          text-align: center;
          background-image: url('/images/grid-pattern.png');
          background-size: cover;
          background-position: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .architects-image-container {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin: 0 auto 2.5rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .grid-image {
          width: 100%;
          height: auto;
          max-height: 300px; /* Increased max height for a bigger image */
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .architects-image-container:hover .grid-image {
          transform: scale(1.05);
        }

        .architects-card-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          background: linear-gradient(90deg, #e2e8f0, #ffffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .architects-card-subtitle {
          font-size: 1.1rem;
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto 2.5rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .explore-button {
          background: linear-gradient(90deg, #4f46e5, #818cf8);
          border: none;
        }

        .explore-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.4);
        }

        .meet-button {
          background-color: transparent;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .meet-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          border-color: white;
        }

        .glow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(79, 70, 229, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .floating-image {
          position: absolute;
          z-index: 5;
        }
        
        .Paint-image {
          top: -80px;
          right: -100px;
        }
        
        .furniture-image {
          bottom: 60px;
          left: -100px;
        }

        @media (max-width: 768px) {
          .architects-card-title {
            font-size: 2rem;
          }

          .architects-card-subtitle {
            font-size: 1rem;
          }

          .cta-buttons {
            flex-direction: column;
            width: 100%;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }

          .grid-image {
            max-height: 200px; /* Adjust for smaller screens */
          }
          
          .floating-image {
            display: none;
          }
        }

        @property --border-angle {
          syntax: "<angle>";
          initial-value: 0turn;
          inherits: false;
        }
      `}</style>

      <div className="architects-card">
        <div className="architects-card-content">
          <div className="architects-image-container">
            <img
              src={architect}
              alt="Modern architecture"
              className="grid-image"
            />
          </div>

          <h2 className="architects-card-title">A Community of Visionaries</h2>
          <p className="architects-card-subtitle">
            Our network of licensed architects combines creativity, experience,
            and technical expertise to make your vision a reality.
          </p>

          <div className="cta-buttons">
            <a href="/projects" className="cta-button explore-button">
              <Search size={18} />
              Explore Projects
            </a>
            <a href="/architects" className="cta-button meet-button">
              <Users size={18} />
              Meet the Architects
            </a>
          </div>

          <div className="glow-overlay"></div>
        </div>
      </div>

      {/* Floating decorative images with Framer Motion */}
      <motion.img
        src={Paint}
        alt="3D Paint"
        height={262}
        width={262}
        className="floating-image Paint-image"
        style={{
          translateY,
        }}
      />

      <motion.img
        src={furniture}
        alt="3D furniture"
        height={248}
        width={248}
        className="floating-image furniture-image"
        style={{
          translateY,
        }}
      />
    </section>
  );
};

export default ArchitectsHighlight;
