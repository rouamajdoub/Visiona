import React from "react";
import "./Policy.css";

const Policy = () => {
  return (
    <div className="policy-container">
      <div className="policy-wrapper">
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-updated">Last updated: April 23, 2025</p>

        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Visiona! This Privacy Policy explains how we collect,
            use, and protect your information when you use our platform. By
            using Visiona, you agree to the terms outlined in this policy.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <ul>
            <li>
              <strong>Personal Information:</strong> Name, email, phone number,
              and payment details.
            </li>
            <li>
              <strong>Professional Information:</strong> For architects, we
              collect license numbers, location, and portfolio data.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, and
              user activity.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide, operate, and maintain the platform.</li>
            <li>
              To match clients with architects based on preferences and
              location.
            </li>
            <li>To manage subscriptions and process payments.</li>
            <li>
              To send updates, newsletters, and respond to support requests.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Sharing Your Information</h2>
          <p>
            We do not sell your personal data. We may share data with
            third-party services like payment providers and hosting platforms,
            solely to provide our services.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Data Security</h2>
          <p>
            We take data security seriously and implement strong measures to
            protect your information, including encryption and regular audits.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Your Rights</h2>
          <p>
            You may access, correct, or delete your personal information by
            contacting us at{" "}
            <a href="mailto:contact@visiona.tn">contact@visiona.tn</a>.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy. When we do, we will revise the
            "Last updated" date at the top of the page.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at{" "}
            <a href="mailto:contact@visiona.tn">contact@visiona.tn</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Policy;
