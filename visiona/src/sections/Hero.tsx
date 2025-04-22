"use client";

import ArrowIcon from "@/assets/arrow-right.svg";
import house from "@/assets/view-3d-graphic-house.png";
import pot from "@/assets/plant-pot.png";
import sofa from "@/assets/white_inflatable_ring.png";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef } from "react";

export const Hero = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const handleSignUpClick = () => {
    window.location.href = "http://localhost:3000/signup"; // Redirect to the external URL
  };
  const handleLearnMoreClick = () => {
    window.location.href = "http://localhost:3000/about";
  };

  return (
    <section
      ref={heroRef}
      className="pt-8 pb-20 md:pt-5 md:pb-10 bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#183EC2,#EAEEFE_100%)] overflow-x-clip"
    >
      <div className="container">
        <div className="md:flex items-center">
          <div className="md:w-[478px]">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text mt-6">
              Your Vision, Our Expertise{" "}
            </h1>
            <p className="text-xl text-[#010D3E] tracking-tight mt-6">
              We connect you with top-tier architects who transform your vision
              into beautifully crafted, functional spaces tailored to your
              needs.
            </p>
            <div className="flex gap-1 items-center mt-[30px]">
              <button className="btn btn-primary" onClick={handleSignUpClick}>
                Sign up Now
              </button>{" "}
              <button
                className="btn btn-text gap-1"
                onClick={handleLearnMoreClick}
              >
                <span>Learn more</span>
                <ArrowIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-20 md:mt-0 md:h-[648px] md:flex-1 relative">
            <motion.img
              src={house.src}
              alt="Cog image"
              className="md:absolute md:h-full md:w-auto md:max-w-none md:-left-6 lg:left-0"
              animate={{
                translateY: [-30, 30],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 3,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={pot.src}
              width={220}
              height={220}
              alt="Cylinder image"
              className="hidden md:block -top-8 -left-66 md:absolute"
              style={{
                translateY: translateY,
                rotate: 30,
              }}
            />
            <motion.img
              src={sofa.src}
              width={220}
              alt="Noodle image"
              className="hidden lg:block absolute top-[524px] left-[448px] rotate-[30deg]"
              style={{
                rotate: 30,
                translateY: translateY,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
