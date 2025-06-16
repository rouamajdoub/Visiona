import React from "react";
import { Routes, Route } from "react-router-dom";

// Auth Components
import AuthProvider from "./components/AuthProvider.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

// Public Pages
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import OAuthSuccess from "./pages/auth/AuthSuccess.jsx";

import About from "./pages/About/HeroSlider.jsx";
import InteriorDesignTrends from "./pages/landing/trending/Trending.jsx";
import Policy from "./pages/landing/P-Policy/Policy.jsx";
import { Pricing } from "./pages/subs_selection_page/Pricing.jsx";
import SubscriptionSuccess from "./pages/subs_selection_page/SubscriptionSuccess.jsx";

import SubscriptionCancel from "./pages/subs_selection_page/SubscriptionCancel.jsx";
// Protected Pages - Admin
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard.jsx";

// Protected Pages - Architect
import Main from "./pages/Dashboard/Architect/main.jsx";
import Calender from "./pages/Dashboard/Architect/pages/Calendar/Calendar.jsx";

// Protected Pages - Client
import Clients from "./pages/client_page/page/Home.jsx";
import NeedSheetForm from "./pages/client_page/Global/NeedSheetForm/NeedSheetForm.jsx";
import ClientPortal from "./pages/client_page/Global/account/ClientPortal.jsx";
import MatchSteps from "./pages/client_page/components/ai_matching/MatchSteps.jsx";
import ArchitectMatches from "./pages/client_page/Global/NeedSheetForm/ArchitectMatches.jsx";
import MatchingLoading from "./pages/client_page/Global/NeedSheetForm/MatchingLoadingPage.jsx";

// Architect Container with Context
import ArchitectContainer from "./pages/client_page/Global/Architect-list/ArchitectContainer.js";

// Marketplace
import { MarketplaceProvider } from "./pages/Market/MarketplaceContext/MarketplaceContext.jsx";
import Marketplace from "./pages/Market/market_place/marketplace.jsx";
import ProductDetails from "./pages/Market/ProductDetails/ProductDetails.jsx";
import FavoritesPage from "./pages/Market/Favorites/FavoritesPage.jsx";
import CartPage from "./pages/Market/Cart/CartPage.jsx";

// Error/Status Pages
import UnauthorizedPage from "./components/UnauthorizedPage.jsx";
import PendingApprovalPage from "./components/PendingApprovalPage.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/trending" element={<InteriorDesignTrends />} />
        <Route path="/matches/:needsheetId" element={<ArchitectMatches />} />

        {/* Status Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/architect/pending-approval"
          element={<PendingApprovalPage />}
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Architect Routes - Require approved status */}
        <Route
          path="/architect"
          element={
            <ProtectedRoute roles={["architect"]} requireApproved={true}>
              <Main />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calender"
          element={
            <ProtectedRoute roles={["architect"]} requireApproved={true}>
              <Calender />
            </ProtectedRoute>
          }
        />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

        {/* Client Routes */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute roles={["client"]}>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/needSheet"
          element={
            <ProtectedRoute roles={["client"]}>
              <NeedSheetForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <ProtectedRoute roles={["client"]}>
              <ClientPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match"
          element={
            <ProtectedRoute roles={["client"]}>
              <MatchSteps />
            </ProtectedRoute>
          }
        />

        {/* Updated Architect List Route - Now uses ArchitectContainer */}
        <Route
          path="/architects"
          element={
            <ProtectedRoute roles={["client"]}>
              <ArchitectContainer />
            </ProtectedRoute>
          }
        />
        <Route path="/architects/matching" element={<MatchingLoading />} />

        {/* Mixed Access Routes - Any authenticated user */}
        <Route
          path="/subs"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />

        {/* Marketplace Routes - Any authenticated user */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <MarketplaceProvider>
                <Marketplace />
              </MarketplaceProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace/product/:id"
          element={
            <ProtectedRoute>
              <MarketplaceProvider>
                <ProductDetails
                  productId={window.location.pathname.split("/").pop()}
                />
              </MarketplaceProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace/favorites"
          element={
            <ProtectedRoute>
              <MarketplaceProvider>
                <FavoritesPage />
              </MarketplaceProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace/cart"
          element={
            <ProtectedRoute>
              <MarketplaceProvider>
                <CartPage />
              </MarketplaceProvider>
            </ProtectedRoute>
          }
        />

        {/* Default Route - Public */}
        <Route path="*" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
