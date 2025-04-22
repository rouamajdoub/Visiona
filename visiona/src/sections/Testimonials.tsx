"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import avatar6 from "@/assets/avatar-6.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar8 from "@/assets/avatar-8.png";
import avatar9 from "@/assets/avatar-9.png";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import React from "react";

const testimonials = [
  {
    text: "As an architect, finding the right clients used to be a challenge. Visiona's AI-powered matching system has completely changed the game for me.",
    imageSrc: avatar1.src,
    name: "Jamie Rivera",
    username: "@jamier_architect",
  },
  {
    text: "Thanks to Visiona, I connected with the perfect architect for my renovation project. The process was seamless and stress-free!",
    imageSrc: avatar2.src,
    name: "Josh Smith",
    username: "@josh_homeowner",
  },
  {
    text: "Managing multiple projects is now effortless. The dashboard and Kanban system keep everything organized and efficient.",
    imageSrc: avatar3.src,
    name: "Morgan Lee",
    username: "@morgan_archi",
  },
  {
    text: "I was amazed at how quickly I could showcase my work and attract new clients through Visiona’s marketplace.",
    imageSrc: avatar4.src,
    name: "Casey Jordan",
    username: "@caseyj_designs",
  },
  {
    text: "Visiona's budget estimator helped me plan my project expenses better and stay on track financially.",
    imageSrc: avatar5.src,
    name: "Taylor Kim",
    username: "@taylork_planner",
  },
  {
    text: "The ability to create quotes and invoices directly within the platform has saved me so much time!",
    imageSrc: avatar6.src,
    name: "Riley Smith",
    username: "@riley_architect",
  },
  {
    text: "With Visiona, I can now track my project views and client interactions, helping me improve my portfolio visibility.",
    imageSrc: avatar7.src,
    name: "Jordan Patels",
    username: "@jpatels_viz",
  },
  {
    text: "The integrated marketplace allows me to showcase my products and reach a wider audience effortlessly.",
    imageSrc: avatar8.src,
    name: "Sam Dawson",
    username: "@dawson_interior",
  },
  {
    text: "Visiona is the all-in-one solution for architects and clients. From project management to client acquisition, it's a game changer!",
    imageSrc: avatar9.src,
    name: "Casey Harper",
    username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => (
  <div className={props.className}>
    <motion.div
      animate={{
        translateY: "-50px",
      }}
      transition={{
        duration: props.duration || 10,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-6 pb-6"
    >
      {[...new Array(2)].fill(0).map((_, index) => (
        <React.Fragment key={index}>
          {props.testimonials.map(
            ({ text, imageSrc, name, username }, index) => (
              <div className="card" key={index}>
                {" "}
                {/* Added key here */}
                <div>{text}</div>
                <div className="flex items-center gap-2 mt-5">
                  <Image
                    src={imageSrc}
                    alt={name} 
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium tracking-tight leading-5">
                      {name}
                    </div>
                    <div className="leading-5 tracking-tight">{username}</div>
                  </div>
                </div>
              </div>
            )
          )}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export const Testimonials = () => {
  return (
    <section className="bg-white">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag"> Success Stories</div>
          </div>
          <h2 className="section-title mt-5">
            Why Architects & Clients Choose Visiona
          </h2>
          <p className="section-description mt-5">
            Real stories from professionals who found success with Visiona.
          </p>
        </div>
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};
