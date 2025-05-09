"use client";
import { useState } from "react";
import ArrowRight from "@/assets/arrow-right.svg";
import Logo from "@/assets/logo_v.png";
import Logo2 from "@/assets/logo.png";
import Image from "next/image";
import MenuIcon from "@/assets/menu.svg";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to handle smooth scrolling to sections with proper TypeScript typing
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false); // Close mobile menu after selection

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 backdrop-blur-sm z-20 bg-white/80">
      <div className="flex justify-center items-center py-3 bg-black text-white text-sm gap-3">
        <Image src={Logo2} alt="Logo" height={30} width={30} />

        <p className="text-white/60 hidden md:block">
          Enhance Your Space, Elevate Your Style{" "}
        </p>

        <div className="inline-flex gap-1 items-center">
          <p>Get started </p>
          <ArrowRight className="h-4 w-4 inline-flex justify-center items-center" />
        </div>
      </div>
      <div className="py-5">
        <div className="container">
          <div className="flex items-center justify-between">
            <Image src={Logo} alt="Logo" height={90} width={90} />
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
                onClick={() => scrollToSection("productShowcase")}
                className="hover:text-black cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="hover:text-black cursor-pointer"
              >
                Customers
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="hover:text-black cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="hover:text-black cursor-pointer"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection("callToAction")}
                className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight"
              >
                Start Now
              </button>
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
                  onClick={() => scrollToSection("productShowcase")}
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
                <button
                  onClick={() => scrollToSection("callToAction")}
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium tracking-tight"
                >
                  Start Now
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
