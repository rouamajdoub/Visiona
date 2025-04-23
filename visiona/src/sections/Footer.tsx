"use client";
import Image from "next/image";
import logo from "@/assets/logo.png";
import SocialInsta from "@/assets/social-insta.svg";
import SocialF from "@/assets/social-f.svg";
import { useRef } from "react";

// Define types for our link structure
type FooterLink = {
  name: string;
  href: string;
  onClick?: () => void;
};

type FooterLinksType = {
  [category: string]: FooterLink[];
};

export const Footer = () => {
  const handleLearnMoreClick = () => {
    window.location.href = "http://localhost:3000/about";
  };
  const handleTrendClick = () => {
    window.location.href = "http://localhost:3000/trending";
  };
  const handlePolicyClick = () => {
    window.location.href = "http://localhost:3000/policy";
  };
  // Footer navigation links organized by categories
  const footerLinks: FooterLinksType = {
    Company: [
      { name: "About", href: "#hero" },
      { name: "Learn More", href: "#", onClick: handleLearnMoreClick },
    ],
    Products: [
      { name: "Features", href: "#productShowcase" },
      { name: "Pricing", href: "#pricing" },
      { name: "Showcase", href: "#productShowcase" },
      { name: "What's New", href: "#", onClick: handleTrendClick },
    ],
    Support: [
      { name: "FAQ", href: "#faq" },
      { name: "Customers", href: "#testimonials" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#", onClick: handlePolicyClick },
      { name: "Terms of Service", href: "#" },
    ],
  };

  // Get categories as an array to avoid TypeScript errors
  const categories = Object.keys(footerLinks);

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo and company info - 2 columns on lg screens */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-70"></div>
                <div className="relative">
                  <Image
                    src={logo}
                    height={70}
                    width={70}
                    alt="Visiona Logo"
                    className="relative z-10"
                  />
                </div>
              </div>
              <span className="ml-3 text-xl font-semibold">Visiona</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              Visiona is your smart gateway to exceptional interior design. We
              connect clients with talented architects through a seamless,
              AI-powered platform. Discover, collaborate, and bring your dream
              space to life with Visiona.
            </p>
            <div className="mb-8 text-gray-400">
              Contact us at:
              <a
                href="mailto:visiona407@gmail.com"
                className="text-white underline ml-1 hover:text-blue-400 transition-colors"
              >
                visiona407@gmail.com
              </a>
            </div>

            <div className="flex space-x-4 mb-8">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialF className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialInsta className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation categories - 1 column each on lg screens */}
          {categories.map((category) => (
            <div key={category} className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {footerLinks[category].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={link.onClick}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright and attribution */}
        <div className="border-t border-gray-800 pt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Visiona, Inc. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-gray-400">
            <a href="#" className="hover:text-white transition-colors mr-4">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors mr-4">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
