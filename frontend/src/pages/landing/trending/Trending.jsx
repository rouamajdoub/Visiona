import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import "./Trend.css";
import img1 from "./img/1.jpg";
import img2 from "./img/2.jpg";
import img3 from "./img/3.jpg";
import img4 from "./img/4.jpg";
import img5 from "./img/5.jpg";
import img6 from "./img/6.jpg";

export default function InteriorDesignBlog() {
  const [activeTab, setActiveTab] = useState("latest");
  const [currentSlide, setCurrentSlide] = useState(0);

  const blogPosts = [
    {
      id: 1,
      title: "Biophilic Design Integration",
      excerpt:
        "Bringing nature indoors through living walls, natural materials, and abundant plants to improve wellbeing and air quality.",
      content:
        "Discover how incorporating natural elements into your interior spaces can transform your home into a sanctuary of wellness and beauty...",
      image: img1,
      author: "Sarah Johnson",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "sustainability",
    },
    {
      id: 2,
      title: "Curved Architectural Elements",
      excerpt:
        "Moving away from sharp angles, curved walls and arched doorways create softer, more welcoming spaces.",
      content:
        "The rise of curved architecture represents a shift towards more organic, human-centered design approaches...",
      image: img2,
      author: "Michael Chen",
      date: "March 12, 2024",
      readTime: "4 min read",
      category: "latest",
    },
    {
      id: 3,
      title: "Multifunctional Spaces",
      excerpt:
        "Post-pandemic interiors prioritize adaptable spaces that serve multiple purposes for work, leisure, and wellness.",
      content:
        "Learn how to create flexible living spaces that adapt to your changing needs throughout the day...",
      image: img3,
      author: "Emma Rodriguez",
      date: "March 10, 2024",
      readTime: "6 min read",
      category: "functionality",
    },
    {
      id: 4,
      title: "Textured Materiality",
      excerpt:
        "Rich textures in plaster, terrazzo, and natural stone create visual interest and tactile experiences.",
      content:
        "Explore how different textures can add depth and character to your interior spaces...",
      image: img4,
      author: "David Park",
      date: "March 8, 2024",
      readTime: "4 min read",
      category: "materials",
    },
    {
      id: 5,
      title: "Bold Color Blocking",
      excerpt:
        "Striking color combinations define spaces and create mood without the need for physical barriers.",
      content:
        "Master the art of using bold colors to transform and define your living spaces...",
      image: img5,
      author: "Lisa Thompson",
      date: "March 5, 2024",
      readTime: "5 min read",
      category: "color",
    },
    {
      id: 6,
      title: "Sustainable Materials",
      excerpt:
        "Reclaimed wood, recycled metals, and biodegradable finishes lead eco-conscious design approaches.",
      content:
        "Discover sustainable materials that don't compromise on style while protecting our environment...",
      image: img6,
      author: "Alex Kumar",
      date: "March 3, 2024",
      readTime: "7 min read",
      category: "sustainability",
    },
  ];

  const categories = [
    { id: "latest", name: "Latest Posts" },
    { id: "sustainability", name: "Sustainability" },
    { id: "functionality", name: "Functionality" },
    { id: "materials", name: "Materials" },
    { id: "color", name: "Color Trends" },
  ];

  const filteredPosts =
    activeTab === "latest"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeTab);

  const maxSlides = Math.ceil(filteredPosts.length / 3);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const visiblePosts = filteredPosts.slice(
    currentSlide * 3,
    currentSlide * 3 + 3
  );

  return (
    <div className="blog-container">
      {/* Header */}
      <header className="blog-header">
        <div className="header-content">
          <h1 className="header-title">Interior Design Blog</h1>
          <p className="header-subtitle">
            Discover the latest trends, tips, and inspiration for creating
            beautiful spaces
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-container">
        <div className="nav-content">
          <nav className="nav-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveTab(category.id);
                  setCurrentSlide(0);
                }}
                className={`nav-tab ${
                  activeTab === category.id ? "active" : ""
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Blog Posts Section */}
      <section className="posts-section">
        <div className="posts-content">
          <h2 className="section-title">
            {activeTab === "latest"
              ? "Latest Posts"
              : categories.find((c) => c.id === activeTab)?.name}
          </h2>

          <div className="posts-grid">
            {visiblePosts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-image-container">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="post-image"
                  />
                  <div className="post-category-badge">{post.category}</div>
                </div>

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>

                  <div className="post-meta">
                    <div className="post-meta-left">
                      <span className="meta-item">
                        <User size={14} />
                        {post.author}
                      </span>
                      <span className="meta-item">
                        <Calendar size={14} />
                        {post.date}
                      </span>
                    </div>
                    <span className="read-time">{post.readTime}</span>
                  </div>

                  <button className="read-more-btn">
                    Read More
                    <ArrowRight size={16} className="arrow-icon" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {maxSlides > 1 && (
            <div className="pagination">
              <button
                onClick={prevSlide}
                className="pagination-btn"
                disabled={currentSlide === 0}
              >
                <ChevronLeft size={24} />
              </button>

              <div className="pagination-dots">
                {Array.from({ length: maxSlides }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`pagination-dot ${
                      currentSlide === i ? "active" : ""
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="pagination-btn"
                disabled={currentSlide === maxSlides - 1}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Resources */}
      <section className="resources-section">
        <div className="resources-content">
          <h2 className="resources-title">Design Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3 className="resource-title">Design Guides</h3>
              <p className="resource-description">
                Comprehensive guides to help you navigate interior design
                principles and techniques.
              </p>
              <a href="/Login" className="resource-link">
                Explore Guides →
              </a>
            </div>

            <div className="resource-card">
              <h3 className="resource-title">Color Palettes</h3>
              <p className="resource-description">
                Curated color combinations and palettes for every style and
                mood.
              </p>
              <a href="/Login" className="resource-link">
                Browse Palettes →
              </a>
            </div>

            <div className="resource-card">
              <h3 className="resource-title">Expert Tips</h3>
              <p className="resource-description">
                Professional advice and insider secrets from leading interior
                designers.
              </p>
              <a href="/Login" className="resource-link">
                Read Tips →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
