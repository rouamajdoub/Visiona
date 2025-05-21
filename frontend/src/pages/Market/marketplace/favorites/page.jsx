"use client";

import { MarketplaceProvider } from "../../MarketplaceContext/MarketplaceContext";
import FavoritesPage from "../../Favorites/FavoritesPage";

export default function FavoritesRoute() {
  return (
    <MarketplaceProvider>
      <FavoritesPage />
    </MarketplaceProvider>
  );
}
