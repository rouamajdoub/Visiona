"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Sample product data - in a real app, this would come from an API
const sampleProducts = [
  {
    id: 1,
    title: "Minimalist Wooden Coffee Table",
    price: 299,
    category: "furniture",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "A sleek, minimalist coffee table crafted from sustainable oak. The perfect centerpiece for your living room with its clean lines and natural finish.",
    popularity: 4.8,
    inStock: true,
  },
  {
    id: 2,
    title: "Scandinavian Lounge Chair",
    price: 499,
    category: "furniture",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Embrace comfort and style with this Scandinavian-inspired lounge chair. Features organic curves and premium upholstery for ultimate relaxation.",
    popularity: 4.9,
    inStock: true,
  },
  {
    id: 3,
    title: "Geometric Pendant Light",
    price: 129,
    category: "lighting",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Transform your space with this striking geometric pendant light. Casts beautiful shadow patterns while providing warm, ambient lighting.",
    popularity: 4.5,
    inStock: true,
  },
  {
    id: 4,
    title: "Handwoven Wool Area Rug",
    price: 349,
    category: "textiles",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Add warmth and texture to your floors with this handwoven wool rug. Features a subtle pattern in neutral tones that complement any interior.",
    popularity: 4.7,
    inStock: true,
  },
  {
    id: 5,
    title: "Ceramic Vase Set",
    price: 89,
    category: "decor",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "A set of three handcrafted ceramic vases in complementary shapes and sizes. Perfect for displaying fresh or dried arrangements.",
    popularity: 4.6,
    inStock: true,
  },
  {
    id: 6,
    title: "Modular Bookshelf System",
    price: 599,
    category: "furniture",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "A customizable bookshelf system that grows with your collection. Combine multiple units for a statement wall or use individually.",
    popularity: 4.8,
    inStock: false,
  },
  {
    id: 7,
    title: "Abstract Wall Art",
    price: 249,
    category: "decor",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Original abstract canvas art to add a pop of color to your walls. Each piece is hand-painted and unique.",
    popularity: 4.4,
    inStock: true,
  },
  {
    id: 8,
    title: "Smart Home Lighting Kit",
    price: 199,
    category: "lighting",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Control the ambiance of your home with this smart lighting kit. Includes bulbs, strips, and a hub for seamless integration.",
    popularity: 4.9,
    inStock: true,
  },
  {
    id: 9,
    title: "Linen Throw Pillows",
    price: 79,
    category: "textiles",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Set of four linen throw pillows in complementary earth tones. Add texture and comfort to any seating area.",
    popularity: 4.7,
    inStock: true,
  },
  {
    id: 10,
    title: "Marble Side Table",
    price: 349,
    category: "furniture",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Elegant side table with a genuine marble top and brass-finished legs. A touch of luxury for your living space.",
    popularity: 4.8,
    inStock: true,
  },
  {
    id: 11,
    title: "Handblown Glass Decanter",
    price: 119,
    category: "decor",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Artisanal handblown glass decanter with matching tumblers. A functional art piece for your bar or dining table.",
    popularity: 4.6,
    inStock: true,
  },
  {
    id: 12,
    title: "Velvet Accent Chair",
    price: 449,
    category: "furniture",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Make a statement with this plush velvet accent chair. Available in jewel tones to add a touch of luxury to any room.",
    popularity: 4.7,
    inStock: true,
  },
];

const MarketplaceContext = createContext();

export function MarketplaceProvider({ children }) {
  const [products, setProducts] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOption, setSortOption] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((product) => product.category === activeCategory);
    }

    // Filter by price range
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "popularity") {
      result.sort((a, b) => b.popularity - a.popularity);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, activeCategory, sortOption, priceRange]);

  // Toggle favorite status
  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter((id) => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Update cart item quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Get product by ID
  const getProduct = (productId) => {
    return products.find(
      (product) => product.id === Number.parseInt(productId)
    );
  };

  // Get all categories
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        filteredProducts,
        favorites,
        cart,
        cartTotal,
        searchQuery,
        activeCategory,
        sortOption,
        priceRange,
        categories,
        setSearchQuery,
        setActiveCategory,
        setSortOption,
        setPriceRange,
        toggleFavorite,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getProduct,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  return useContext(MarketplaceContext);
}
