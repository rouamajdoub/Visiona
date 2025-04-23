import { useState } from "react";
import {
  Bookmark,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import img1 from "./img/1.jpg";
import img2 from "./img/2.jpg";
import img3 from "./img/5.jpg";
import img4 from "./img/7.jpg";
import img5 from "./img/8.jpg";
import img6 from "./img/12.jpg";
import "./Trend.css";
export default function InteriorDesignTrends() {
  const [activeTab, setActiveTab] = useState("latest");
  const [currentSlide, setCurrentSlide] = useState(0);

  const trends = [
    {
      id: 1,
      title: "Biophilic Design Integration",
      description:
        "Bringing nature indoors through living walls, natural materials, and abundant plants to improve wellbeing and air quality.",
      image: img1,
      likes: 543,
      saves: 328,
      category: "sustainability",
    },
    {
      id: 2,
      title: "Curved Architectural Elements",
      description:
        "Moving away from sharp angles, curved walls and arched doorways create softer, more welcoming spaces.",
      image: img2,
      likes: 487,
      saves: 276,
      category: "latest",
    },
    {
      id: 3,
      title: "Multifunctional Spaces",
      description:
        "Post-pandemic interiors prioritize adaptable spaces that serve multiple purposes for work, leisure, and wellness.",
      image: img3,
      likes: 621,
      saves: 412,
      category: "functionality",
    },
    {
      id: 4,
      title: "Textured Materiality",
      description:
        "Rich textures in plaster, terrazzo, and natural stone create visual interest and tactile experiences.",
      image: img4,
      likes: 398,
      saves: 217,
      category: "materials",
    },
    {
      id: 5,
      title: "Bold Color Blocking",
      description:
        "Striking color combinations define spaces and create mood without the need for physical barriers.",
      image: img5,
      likes: 512,
      saves: 342,
      category: "color",
    },
    {
      id: 6,
      title: "Sustainable Materials",
      description:
        "Reclaimed wood, recycled metals, and biodegradable finishes lead eco-conscious design approaches.",
      image: img6,
      likes: 678,
      saves: 489,
      category: "sustainability",
    },
  ];

  const categories = [
    { id: "latest", name: "Latest Trends" },
    { id: "sustainability", name: "Sustainability" },
    { id: "functionality", name: "Functionality" },
    { id: "materials", name: "Materials" },
    { id: "color", name: "Color Trends" },
  ];

  const filteredTrends =
    activeTab === "latest"
      ? trends
      : trends.filter((trend) => trend.category === activeTab);

  const maxSlides = Math.ceil(filteredTrends.length / 3);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const visibleTrends = filteredTrends.slice(
    currentSlide * 3,
    currentSlide * 3 + 3
  );

  return (
    <div className="container-main">
      {/* Header */}
      <header className="header-section">
        <div className="header-content">
          <h1 className="text-3xl font-bold mb-2">
            Interior Architecture & Design
          </h1>
          <p className="text-gray-300">
            Discover the latest trends reshaping modern spaces
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-container">
        <div className="nav-inner">
          <nav className="nav-buttons">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveTab(category.id);
                  setCurrentSlide(0);
                }}
                className={`nav-button ${
                  activeTab === category.id ? "active" : ""
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Featured Section */}
      <section className="featured-section">
        <div className="section-container">
          <h2 className="section-title">
            Featured{" "}
            {activeTab === "latest"
              ? "Trends"
              : categories.find((c) => c.id === activeTab).name}
          </h2>

          <div className="relative">
            <div className="trends-grid">
              {visibleTrends.map((trend) => (
                <div key={trend.id} className="trend-card">
                  <div className="card-inner">
                    <div className="relative">
                      <img
                        src={trend.image}
                        alt={trend.title}
                        className="card-image"
                      />
                      <div className="card-buttons">
                        <button className="icon-button">
                          <Heart size={18} className="text-gray-700" />
                        </button>
                        <button className="icon-button">
                          <Bookmark size={18} className="text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{trend.title}</h3>
                      <p className="card-description">{trend.description}</p>
                      <div className="card-stats">
                        <div className="stats-group">
                          <span className="flex items-center">
                            <Heart size={16} className="mr-1" /> {trend.likes}
                          </span>
                          <span className="flex items-center">
                            <Bookmark size={16} className="mr-1" />{" "}
                            {trend.saves}
                          </span>
                        </div>
                        <button className="share-button">
                          Share <Share2 size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {maxSlides > 1 && (
              <div className="carousel-controls">
                <button
                  onClick={prevSlide}
                  className="control-button"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="dots-container">
                  {Array.from({ length: maxSlides }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`dot-button ${
                        currentSlide === i ? "active" : ""
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="control-button"
                  disabled={currentSlide === maxSlides - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Design Resources */}
      <section className="resources-section">
        <div className="section-container">
          <h2 className="section-title">Design Resources</h2>
          <div className="resources-grid">
            {/* ... keep resource cards structure same, update classes ... */}
            <div className="resource-card">
              <h3 className="text-xl font-bold mb-2">Design Professionals</h3>
              <p className="text-gray-600 mb-4">
                Connect with certified interior architects and designers.
              </p>
              <button className="text-blue-600 font-medium">
                Browse Directory
              </button>
            </div>
            {/* Repeat similar structure for other resource cards */}
          </div>
        </div>
      </section>
    </div>
  );
}
