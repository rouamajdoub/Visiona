"use client";

import { MarketplaceProvider } from "../../MarketplaceContext/MarketplaceContext";
import ProductDetails from "../../../ProductDetails/ProductDetails";

export default function ProductPage({ params }) {
  return (
    <MarketplaceProvider>
      <ProductDetails productId={params.id} />
    </MarketplaceProvider>
  );
}
