"use client";

import { useMarketplace } from "../MarketplaceContext/MarketplaceContext";
import "./favorites.css";

const FavoritesPage = () => {
  const { products, favorites, toggleFavorite, addToCart } = useMarketplace();

  const favoriteProducts = products.filter((product) =>
    favorites.includes(product.id)
  );

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>Your Favorites</h1>
        <p>Items you've saved for later</p>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="favorites-grid">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="favorites-item">
              <div className="favorites-item-image">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                />
                <button
                  className="favorites-remove-button"
                  onClick={() => toggleFavorite(product.id)}
                  aria-label="Remove from favorites"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <div className="favorites-item-info">
                <h3>{product.title}</h3>
                <div className="favorites-item-meta">
                  <span className="favorites-item-price">${product.price}</span>
                  <span className="favorites-item-category">
                    {product.category}
                  </span>
                </div>

                <div className="favorites-item-actions">
                  <a
                    href={`/marketplace/product/${product.id}`}
                    className="favorites-view-button"
                  >
                    View Details
                  </a>
                  <button
                    className="favorites-cart-button"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2>No favorites yet</h2>
          <p>
            Start adding items to your favorites by clicking the heart icon on
            products you love.
          </p>
          <a href="/marketplace" className="favorites-browse-button">
            Browse Products
          </a>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
