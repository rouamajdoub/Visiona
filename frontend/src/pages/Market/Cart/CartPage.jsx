"use client";

import { useState } from "react";
import { useMarketplace } from "../MarketplaceContext/MarketplaceContext";
import "./cart.css";

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } =
    useMarketplace();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    updateCartQuantity(productId, newQuantity);
  };

  const handlePromoCode = () => {
    // In a real app, you would validate the promo code with an API
    if (promoCode.toLowerCase() === "visiona20") {
      setPromoApplied(true);
    } else {
      alert("Invalid promo code");
    }
  };

  const discount = promoApplied ? cartTotal * 0.2 : 0;
  const finalTotal = cartTotal - discount;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <p>
          {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                  />
                </div>

                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  <span className="cart-item-category">{item.category}</span>
                  <span className="cart-item-price">${item.price}</span>
                </div>

                <div className="cart-item-quantity">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
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
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            {promoApplied && (
              <div className="cart-summary-row discount">
                <span>Discount (20%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="cart-summary-row total">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>

            <div className="cart-promo">
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
              />
              <button
                onClick={handlePromoCode}
                disabled={promoApplied || !promoCode}
              >
                {promoApplied ? "Applied" : "Apply"}
              </button>
            </div>

            {promoApplied && (
              <div className="cart-promo-success">
                Promo code VISIONA20 applied successfully!
              </div>
            )}

            <button className="cart-checkout-button">
              Proceed to Checkout
            </button>

            <a href="/marketplace" className="cart-continue-shopping">
              Continue Shopping
            </a>
          </div>
        </div>
      ) : (
        <div className="cart-empty">
          <div className="cart-empty-icon">
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
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <a href="/marketplace" className="cart-browse-button">
            Browse Products
          </a>
        </div>
      )}
    </div>
  );
};

export default CartPage;
