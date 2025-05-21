"use client";

import { MarketplaceProvider } from "../../MarketplaceContext/MarketplaceContext";
import CartPage from "../../Cart/CartPage";

export default function CartRoute() {
  return (
    <MarketplaceProvider>
      <CartPage />
    </MarketplaceProvider>
  );
}
