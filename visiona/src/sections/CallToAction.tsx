"use client";

import ArrowRight from "@/assets/arrow-right.svg";
import starImage from "@/assets/star.png";
import springImage from "@/assets/spring.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAuth } from "@/utils/auth-context";
import Link from "next/link";

export const CallToAction = () => {
  const { user, isAuthenticated } = useAuth();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  const handleSignUpClick = () => {
    window.location.href = "http://localhost:3000/signup"; // Redirect to the external URL
  };

  const handleLearnMoreClick = () => {
    window.location.href = "http://localhost:3000/about"; // Redirect to the external URL
  };

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-[#D2DCFF] py-24 overflow-x-clip"
    >
      <div className="container">
        <div className="section-heading relative">
          {isAuthenticated ? (
            <>
              <h2 className="section-title">Welcome, {user?.name}!</h2>
              <p className="section-description mt-5">
                {user?.role === "architect"
                  ? "Manage your projects, showcase your work, and connect with new clients."
                  : "Discover amazing architects and bring your design vision to life."}
              </p>
            </>
          ) : (
            <>
              <h2 className="section-title">Join the Visiona Community</h2>
              <p className="section-description mt-5">
                With Visiona, managing projects, clients, and designs has never
                been easier.
              </p>
            </>
          )}
          <motion.img
            src={starImage.src}
            alt="Star Image"
            width={360}
            className="absolute -left-[350px] -top-[137px]"
            style={{
              translateY,
            }}
          />
          <motion.img
            src={springImage.src}
            alt="Spring Image"
            width={360}
            className="absolute -right-[331px] -top-[19px]"
            style={{
              translateY,
            }}
          />
        </div>
        <div className="flex gap-2 mt-10 justify-center">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="btn btn-primary">
                My Account
              </Link>
              {user?.role === "architect" && (
                <a
                  href="http://localhost:3000/upload-project"
                  className="btn btn-text gap-1"
                >
                  <span>Upload Project</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              )}
              {user?.role === "client" && (
                <a
                  href="http://localhost:3000/projects"
                  className="btn btn-text gap-1"
                >
                  <span>Browse Projects</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              )}
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleSignUpClick}>
                Sign up
              </button>
              <button
                className="btn btn-text gap-1"
                onClick={handleLearnMoreClick}
              >
                <span>Learn more</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
