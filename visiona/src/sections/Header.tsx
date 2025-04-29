"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ArrowRight from "@/assets/arrow-right.svg";
import Logo from "@/assets/logo_v.png";
import Logo2 from "@/assets/logo.png";
import MenuIcon from "@/assets/menu.svg";
import { useAuth } from "@/utils/auth-context";
import { useAuthSync } from "@/utils/useAuthSync";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Use the auth sync hook to ensure we're always up to date
  useAuthSync();

  // Get user's display name from various possible fields
  const getUserDisplayName = () => {
    if (!user) return null;

    // Try different field combinations based on your user model
    if (user.name) return user.name;
    if (user.pseudo) return user.pseudo;
    if (user.prenom && user.nomDeFamille)
      return `${user.prenom} ${user.nomDeFamille}`;
    if (user.prenom) return user.prenom;

    // Fallback to email prefix
    return user.email.split("@")[0];
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false); // Close mobile menu after selection

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStartNowClick = () => {
    if (isAuthenticated) {
      // If logged in, go to profile
      window.location.href = "/profile";
    } else {
      // If not logged in, go to signup
      window.location.href = "http://localhost:3000/signup";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function will handle the redirect
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 backdrop-blur-sm z-20 bg-white/80">
      <div className="flex justify-center items-center py-3 bg-black text-white text-sm gap-3">
        <Image src={Logo2} alt="Logo" height={30} width={30} />

        <p className="text-white/60 hidden md:block">
          Enhance Your Space, Elevate Your Style{" "}
        </p>

        {isAuthenticated ? (
          <div className="inline-flex gap-1 items-center">
            <p>Welcome, {getUserDisplayName()}</p>
          </div>
        ) : (
          <div className="inline-flex gap-1 items-center">
            <p>Get started </p>
            <ArrowRight className="h-4 w-4 inline-flex justify-center items-center" />
          </div>
        )}
      </div>
      <div className="py-5">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src={Logo} alt="Logo" height={90} width={90} />
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden"
              aria-label="Toggle mobile menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <nav className="hidden md:flex gap-6 text-black/60 items-center">
              <button
                onClick={() => scrollToSection("hero")}
                className="hover:text-black cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="hover:text-black cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="hover:text-black cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="hover:text-black cursor-pointer"
              >
                Customers
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="hover:text-black cursor-pointer"
              >
                FAQ
              </button>

              {isAuthenticated ? (
                <>
                  {user?.role === "architect" && (
                    <a
                      href="http://localhost:3000/architect"
                      className="hover:text-black cursor-pointer"
                    >
                      Dashboard
                    </a>
                  )}
                  <a
                    href="http://localhost:3000/profile"
                    className="hover:text-black cursor-pointer"
                  >
                    My Account
                  </a>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="http://localhost:3000/login"
                    className="hover:text-black cursor-pointer"
                  >
                    Login
                  </a>
                  <button
                    onClick={handleStartNowClick}
                    className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight"
                  >
                    Start Now
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Mobile menu - shown when toggled */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-3 px-4 bg-white/95 rounded-lg shadow-lg">
              <nav className="flex flex-col gap-4 text-black/60">
                <button
                  onClick={() => scrollToSection("hero")}
                  className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                >
                  Customers
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                >
                  FAQ
                </button>

                {isAuthenticated ? (
                  <>
                    {user?.role === "architect" && (
                      <a
                        href="http://localhost:3000/architect"
                        className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                      >
                        Dashboard
                      </a>
                    )}
                    <a
                      href="http://localhost:3000/profile"
                      className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                    >
                      My Account
                    </a>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium tracking-tight"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="http://localhost:3000/login"
                      className="py-2 border-b border-gray-100 text-left hover:text-black cursor-pointer"
                    >
                      Login
                    </a>
                    <button
                      onClick={handleStartNowClick}
                      className="bg-black text-white px-4 py-2 rounded-lg font-medium tracking-tight"
                    >
                      Start Now
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
