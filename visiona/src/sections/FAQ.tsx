"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import X from "@/assets/social-x.svg";
import Plus from "@/assets/check.svg";
// Define the FAQ data structure
const faqItems = [
  {
    category: "For Clients",
    icon: "👤",
    questions: [
      {
        question: "How can I find an architect on the platform?",
        answer:
          "Just create a client account, fill in your needs sheet, and we'll match you with the most suitable architects.",
      },
      {
        question: "Is the service free for clients?",
        answer:
          "Yes, registering and browsing architects is completely free for clients.",
      },
      {
        question: "Can I talk to the architect before starting the project?",
        answer:
          "Absolutely! Once matched, you can chat directly with the architect through our messaging system.",
      },
      {
        question: "Can I leave a review about the architect?",
        answer:
          "Yes, once your project is completed, you'll be able to rate and review the architect.",
      },
    ],
  },
  {
    category: "For Architects",
    icon: "🏗️",
    questions: [
      {
        question: "How can I join the platform as an architect?",
        answer:
          'Click "Sign Up", choose "Architect" as your role, and fill out the registration form. Your profile will be reviewed by our team.',
      },
      {
        question: "What are the benefits of VIP or Premium subscriptions?",
        answer:
          "These subscriptions unlock full access to your dashboard: project management, quotes, invoices, calendar, client tracking—and team management for Premium users.",
      },
      {
        question: "How many projects can I handle with the Free plan?",
        answer:
          "With the Free plan, you can manage up to 6 projects and accept up to 2 new clients per day.",
      },
      {
        question: "Can I customize my quotes and invoices?",
        answer:
          "Yes! You can add your logo, contact info, and generate professional-looking PDFs.",
      },
    ],
  },
  {
    category: "Platform & Support",
    icon: "💻",
    questions: [
      {
        question: "Is my personal information secure?",
        answer:
          "Yes, we use industry-standard encryption and security practices to protect all user data.",
      },
      {
        question: "How can I contact support?",
        answer:
          "You can reach our support team through the 'Help' section in your dashboard or email us at support@visiona.com.",
      },
      {
        question: "Are there mobile apps available?",
        answer:
          "Currently, Visiona is available as a responsive web application that works on all devices. Native mobile apps are on our roadmap.",
      },
      {
        question: "Can I cancel my subscription at any time?",
        answer:
          "Yes, subscriptions can be canceled at any time from your account settings with no cancellation fees.",
      },
    ],
  },
];

export const FAQ = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(
    null
  );

  // Handle category change
  const handleCategoryChange = (index: number) => {
    setActiveCategoryIndex(index);
    setActiveQuestionIndex(null);
  };

  // Toggle question expansion
  const toggleQuestion = (index: number) => {
    setActiveQuestionIndex(activeQuestionIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title">Got Questions? We ve Got Answers!</h2>
          <p className="section-description mt-5">
            Find answers to commonly asked questions about Visiona s platform,
            services, and features.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {faqItems.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryChange(index)}
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategoryIndex === index
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.category}</span>
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="mt-12 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden"
          >
            {faqItems[activeCategoryIndex].questions.map((item, index) => (
              <div
                key={index}
                className={`border-b border-gray-200 last:border-b-0`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="flex justify-between items-center w-full p-5 text-left"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.question}
                  </h3>
                  <div className="ml-2">
                    {activeQuestionIndex === index ? (
                      <X className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Plus className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {activeQuestionIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-gray-700">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
