import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";

export default function InteriorDesignBlog() {
  const [activeTab, setActiveTab] = useState("latest");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Using placeholder images since we can't import the actual images
  const blogPosts = [
    {
      id: 1,
      title: "Biophilic Design Integration",
      excerpt:
        "Bringing nature indoors through living walls, natural materials, and abundant plants to improve wellbeing and air quality.",
      content:
        "Discover how incorporating natural elements into your interior spaces can transform your home into a sanctuary of wellness and beauty...",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Interior Design Blog
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover the latest trends, tips, and inspiration for creating
              beautiful spaces
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-8 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveTab(category.id);
                  setCurrentSlide(0);
                }}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === category.id
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Blog Posts Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {activeTab === "latest"
              ? "Latest Posts"
              : categories.find((c) => c.id === activeTab)?.name}
          </h2>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visiblePosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 capitalize">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User size={14} className="mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {post.date}
                        </span>
                      </div>
                      <span className="text-blue-600 font-medium">
                        {post.readTime}
                      </span>
                    </div>

                    <button className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors group">
                      Read More
                      <ArrowRight
                        size={16}
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {maxSlides > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-4">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: maxSlides }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentSlide === i
                          ? "bg-blue-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide === maxSlides - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Design Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Design Guides
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive guides to help you navigate interior design
                principles and techniques.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Explore Guides →
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Color Palettes
              </h3>
              <p className="text-gray-600 mb-4">
                Curated color combinations and palettes for every style and
                mood.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Browse Palettes →
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Expert Tips
              </h3>
              <p className="text-gray-600 mb-4">
                Professional advice and insider secrets from leading interior
                designers.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Read Tips →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
