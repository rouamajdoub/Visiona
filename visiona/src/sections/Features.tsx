"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

// Import image assets
import matchingIcon from "@/assets/atching-icon.png";
import dashboardIcon from "@/assets/dashboard-icon.png";
import portfolioIcon from "@/assets/portfolio-icon.png";
import quotingIcon from "@/assets/quoting-icon.png";
import plansIcon from "@/assets/plans-icon.png";
import featureDecor from "@/assets/cylinder.png";

const features = [
  {
    title: "Intelligent Matching System",
    description:
      "Our AI analyzes client needs and architect profiles to ensure ideal partnerships based on style, expertise, and budget.",
    icon: matchingIcon,
    color: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    title: "Project Dashboard",
    description:
      "Track timelines, manage documents, and communicate seamlessly in one place—no more scattered emails or missed updates.",
    icon: dashboardIcon,
    color: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    title: "Personalized Portfolios",
    description:
      "Architects showcase their work through personalized portfolios, while clients enjoy an intuitive, guided experience.",
    icon: portfolioIcon,
    color: "bg-green-100",
    textColor: "text-green-700",
  },
  {
    title: "Smart Quoting & Invoicing",
    description:
      "Generate branded documents in seconds, complete with customization options for professional client communications.",
    icon: quotingIcon,
    color: "bg-amber-100",
    textColor: "text-amber-700",
  },
  {
    title: "Tailored Subscription Plans",
    description:
      "Options for every user type, from freelancers to full studios, unlocking powerful tools like analytics and performance tracking.",
    icon: plansIcon,
    color: "bg-rose-100",
    textColor: "text-rose-700",
  },
];

export const Features = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section ref={sectionRef} className="py-24 bg-white overflow-hidden">
      <div className="container relative">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Platform Features</div>
          </div>
          <h2 className="section-title mt-5">
            Everything You Need, All in One Place
          </h2>
          <p className="section-description mt-5">
            We've designed every feature to simplify the way clients and
            interior architects connect, collaborate, and create.
          </p>
        </div>

        {/* Decorative elements */}
        <motion.img
          src={featureDecor.src}
          alt="Decorative element"
          width={200}
          height={200}
          className="absolute -right-16 top-20 opacity-30"
          style={{ translateY }}
        />

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="feature-card bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div
                className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-5`}
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>

              <h3 className={`text-xl font-bold ${feature.textColor} mb-3`}>
                {feature.title}
              </h3>

              <p className="text-gray-700">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
