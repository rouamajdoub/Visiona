"use client";

import { useState } from "react";
import { useMarketplace } from "../MarketplaceContext/MarketplaceContext";
import "./product-details.css";

const ProductDetails = ({ productId }) => {
  const { getProduct, addToCart, toggleFavorite, favorites } = useMarketplace();
  const [quantity, setQuantity] = useState(1);

  const product = getProduct(Number.parseInt(productId));

  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  const isFavorite = favorites.includes(product.id);

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="product-details-container">
      <div className="product-details-breadcrumb">
        <a href="/marketplace">Marketplace</a> /
        <a href={`/marketplace?category=${product.category}`}>
          {product.category}
        </a>{" "}
        /<span>{product.title}</span>
      </div>

      <div className="product-details-content">
        <div className="product-details-image">
          <img src={product.image || "/placeholder.svg"} alt={product.title} />
        </div>

        <div className="product-details-info">
          <h1 className="product-details-title">{product.title}</h1>

          <div className="product-details-meta">
            <span className="product-details-price">${product.price}</span>
            <span className="product-details-category">{product.category}</span>
            <span
              className={`product-details-stock ${
                product.inStock ? "in-stock" : "out-of-stock"
              }`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="product-details-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-details-actions">
            <div className="product-details-quantity">
              <label htmlFor="quantity">Quantity</label>
              <div className="quantity-input">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={!product.inStock}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  disabled={!product.inStock}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-details-buttons">
              <button
                className="product-details-cart-button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                className={`product-details-favorite-button ${
                  isFavorite ? "active" : ""
                }`}
                onClick={() => toggleFavorite(product.id)}
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
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>

              <button className="product-details-order-button">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="product-details-related">
        <h2>You might also like</h2>
        <div className="product-details-related-grid">
          {/* Related products would go here */}
          <div className="product-details-related-placeholder">
            Related products will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
