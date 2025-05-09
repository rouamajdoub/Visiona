import React, { useState } from "react";
import interiorimg from "../../img/interior.jpg"; // Replace with your actual image path
import RRimg from "../../img/RandR.jpg"; // Replace with your actual image path
import landscape from "../../img/LandD.jpg"; // Replace with your actual image path
import DS from "../../img/DS.jpg"; // Replace with your actual image path

import { ArrowRight } from "lucide-react";

const AbtService = () => {
  const [activeService, setActiveService] = useState("interior");

  const services = [
    {
      id: "interior",
      title: "Interior Architecture",
      description: "Design tailored to your lifestyle",
      fullDescription:
        "Our interior architects transform spaces with creative solutions that blend aesthetics and functionality to match your unique lifestyle and preferences.",
      image: interiorimg, // Replace with your actual image path
    },
    {
      id: "renovation",
      title: "Renovation & Remodeling",
      description: "Upgrade your space with confidence",
      fullDescription:
        "From minor updates to complete overhauls, our renovation experts breathe new life into your spaces while maintaining the integrity of your property.",
      image: RRimg, // Replace with your actual image path
    },
    {
      id: "landscape",
      title: "Landscape Design",
      description: "Turn outdoor areas into living spaces",
      fullDescription:
        "Create stunning outdoor environments that extend your living space and connect you with nature through thoughtful landscape design.",
      image: landscape, // Replace with your actual image path
    },
    {
      id: "decoration",
      title: "Decoration & Styling",
      description: "Enhance beauty and functionality",
      fullDescription:
        "Our decorators and stylists add the perfect finishing touches to create harmonious, beautiful spaces that reflect your personality.",
      image: DS, // Replace with your actual image path
    },
  ];

  const handleServiceClick = (id) => {
    setActiveService(id);
  };

  // Find the active service
  const activeServiceData = services.find(
    (service) => service.id === activeService
  );

  return (
    <section className="service-section">
      <style>{`
        .service-section {
          padding: 5rem 2rem;
          max-width: 2900px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
          background-color: white;
        }

        .service-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .service-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.5rem;
          position: relative;
          display: inline-block;
        }

        .service-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          border-radius: 2px;
        }

        .service-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .service-showcase {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .service-showcase {
            flex-direction: row;
          }
        }

        .service-image-container {
          flex: 1;
          border-radius: 16px;
          overflow: hidden;
          height: 400px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .service-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .service-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
          color: white;
        }

        .service-image-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .service-image-description {
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 80%;
        }

        .service-buttons {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          align-content: start;
        }

        .service-button {
          padding: 1.5rem;
          background-color: white;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .service-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          border-color: #2563eb;
        }

        .service-button.active {
          border-color: #2563eb;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.1);
        }

        .service-button.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #2563eb, #60a5fa);
        }

        .service-button-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .service-button-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .service-button-desc {
          font-size: 0.9rem;
          color: #666;
        }

        .see-more-container {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }

        .see-more-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .see-more-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }

        .see-more-button svg {
          transition: transform 0.3s ease;
        }

        .see-more-button:hover svg {
          transform: translateX(5px);
        }

        @media (max-width: 768px) {
          .service-title {
            font-size: 2rem;
          }
          
          .service-image-container {
            height: 300px;
          }
          
          .service-image-title {
            font-size: 1.5rem;
          }
          
          .service-image-description {
            font-size: 1rem;
            max-width: 100%;
          }
        }
      `}</style>

      <div className="service-header">
        <h2 className="service-title">Professionals at Your Service</h2>
      </div>

      <div className="service-container">
        <div className="service-showcase">
          <div className="service-image-container">
            <img
              src={activeServiceData.image}
              alt={activeServiceData.title}
              className="service-image"
            />
            <div className="service-image-overlay">
              <h3 className="service-image-title">{activeServiceData.title}</h3>
              <p className="service-image-description">
                {activeServiceData.fullDescription}
              </p>
            </div>
          </div>

          <div className="service-buttons">
            {services.map((service) => (
              <button
                key={service.id}
                className={`service-button ${
                  activeService === service.id ? "active" : ""
                }`}
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="service-button-icon">{service.icon}</div>
                <h3 className="service-button-title">{service.title}</h3>
                <p className="service-button-desc">{service.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="see-more-container">
          <a href="/services" className="see-more-button">
            See All Services <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AbtService;
