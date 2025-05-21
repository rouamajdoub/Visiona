"use client";

import { MarketplaceProvider } from "../../MarketplaceContext/MarketplaceContext";
import Marketplace from "../../market_place/marketplace";

export default function MarketplacePage() {
  return (
    <MarketplaceProvider>
      <Marketplace />
    </MarketplaceProvider>
  );
}
