"use client";
import Image from "next/image";
import logo from "@/assets/logo.png";
import SocialX from "@/assets/social-x.svg";
import SocialInsta from "@/assets/social-insta.svg";
import SocialLinkedIn from "@/assets/social-linkedin.svg";
import SocialPin from "@/assets/social-pin.svg";
import SocialYoutube from "@/assets/social-youtube.svg";
import { useState } from "react";

// Define types for our link structure
type FooterLink = {
  name: string;
  href: string;
};

type FooterLinksType = {
  [category: string]: FooterLink[];
};

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    console.log("Subscribing email:", email);
    setEmail("");
    alert("Thanks for subscribing!");
  };

  // Footer navigation links organized by categories
  const footerLinks: FooterLinksType = {
    Company: [
      { name: "About", href: "#hero" },
      { name: "Careers", href: "#" },
      { name: "News", href: "#" },
      { name: "Contact", href: "#" },
    ],
    Products: [
      { name: "Features", href: "#productShowcase" },
      { name: "Pricing", href: "#pricing" },
      { name: "Showcase", href: "#productShowcase" },
      { name: "What's New", href: "#" },
    ],
    Support: [
      { name: "Help Center", href: "#" },
      { name: "FAQ", href: "#faq" },
      { name: "Customers", href: "#testimonials" },
      { name: "Documentation", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Compliance", href: "#" },
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
            <p className="text-gray-400 mb-6 max-w-sm">
              Enhance Your Space, Elevate Your Style. We create beautiful
              furniture with premium quality materials designed to last.
            </p>
            <div className="flex space-x-4 mb-8">
              <a
                href="#"
                aria-label="X Social Media"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialX className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialInsta className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialLinkedIn className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Pinterest"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialPin className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SocialYoutube className="h-5 w-5" />
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

        {/* Newsletter subscription */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md mx-auto lg:mx-0">
            <h3 className="text-lg font-semibold mb-3">
              Subscribe to our newsletter
            </h3>
            <p className="text-gray-400 mb-4">
              Get the latest updates on new products and special sales
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="bg-gray-900 text-white px-4 py-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
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
