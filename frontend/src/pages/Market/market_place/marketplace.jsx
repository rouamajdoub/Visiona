"use client";

import { useState, useEffect } from "react";
import { useMarketplace } from "../MarketplaceContext/MarketplaceContext";
import "./marketplace.css";

// Hero Section Component
const HeroSection = () => {
  return (
    <div className="marketplace-hero">
      <div className="marketplace-hero-content">
        <h1>Visiona Marketplace</h1>
        <p>
          Discover unique interior design pieces crafted by our architect
          community
        </p>
        <button className="marketplace-hero-cta">Explore Collection</button>
      </div>
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = () => {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    sortOption,
    setSortOption,
    priceRange,
    setPriceRange,
  } = useMarketplace();

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = Number.parseInt(e.target.value);
    setPriceRange(newRange);
  };

  return (
    <div className="marketplace-filter-sidebar">
      <div className="marketplace-filter-group">
        <h3>Categories</h3>
        <ul className="marketplace-category-list">
          {categories.map((category) => (
            <li
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </li>
          ))}
        </ul>
      </div>

      <div className="marketplace-filter-group">
        <h3>Price Range</h3>
        <div className="marketplace-price-range">
          <div className="marketplace-price-inputs">
            <div>
              <label>Min</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                min="0"
                max={priceRange[1]}
              />
            </div>
            <div>
              <label>Max</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                min={priceRange[0]}
              />
            </div>
          </div>
          <div className="marketplace-price-slider">
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
            />
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
            />
          </div>
        </div>
      </div>

      <div className="marketplace-filter-group">
        <h3>Sort By</h3>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="marketplace-sort-select"
        >
          <option value="popularity">Popularity</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useMarketplace();

  return (
    <div className="marketplace-search-container">
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="marketplace-search-input"
      />
      <button className="marketplace-search-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { toggleFavorite, favorites, addToCart } = useMarketplace();
  const isFavorite = favorites.includes(product.id);

  return (
    <div className="marketplace-product-card">
      <div className="marketplace-product-image">
        <img src={product.image || "/placeholder.svg"} alt={product.title} />
        <button
          className={`marketplace-favorite-button ${
            isFavorite ? "active" : ""
          }`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className="marketplace-product-info">
        <h3>{product.title}</h3>
        <div className="marketplace-product-meta">
          <span className="marketplace-product-price">${product.price}</span>
          <span className="marketplace-product-category">
            {product.category}
          </span>
        </div>
        <div className="marketplace-product-actions">
          <a
            href={`/marketplace/product/${product.id}`}
            className="marketplace-view-button"
          >
            View Details
          </a>
          <button
            className="marketplace-cart-button"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Grid Component
const ProductGrid = () => {
  const { filteredProducts } = useMarketplace();

  return (
    <div className="marketplace-product-grid">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="marketplace-no-results">
          <h3>No products found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
};

// Main Marketplace Component
const Marketplace = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <div className="marketplace-container">
      <HeroSection />

      <div className="marketplace-content">
        <div className="marketplace-top-bar">
          <SearchBar />
          {isMobile && (
            <button
              className="marketplace-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          )}
        </div>

        <div className="marketplace-main">
          {(!isMobile || showFilters) && <FilterSidebar />}
          <div className="marketplace-products-container">
            <ProductGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
