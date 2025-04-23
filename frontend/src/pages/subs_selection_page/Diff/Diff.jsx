import React from "react";
import "./Diff.css";

const Diff = () => {
  const plans = [
    {
      name: "Free",
      description:
        "For beginners or testers - Ideal for architects exploring the platform",
      features: {
        projects: "Up to 3 projects",
        marketplace: "Cannot add products",
        clients: "Cannot add manually",
        quotesInvoices: "No access",
        dashboard: "No access",
        recommendation: "Low priority",
        team: "No team support",
        analytics: "No advanced tools",
      },
    },
    {
      name: "VIP",
      description: "For independent professionals - Best for solo architects",
      features: {
        projects: "Unlimited",
        marketplace: "Limited uploads",
        clients: "Can add clients",
        quotesInvoices: "Create & manage",
        dashboard: "Full access",
        recommendation: "Standard priority",
        team: "No team support",
        analytics: "Basic analytics",
      },
    },
    {
      name: "Premium",
      description: "For growing teams - Advanced operations support",
      features: {
        projects: "Unlimited",
        marketplace: "Higher limits",
        clients: "Advanced management",
        quotesInvoices: "Advanced options",
        dashboard: "Full access",
        recommendation: "Top priority",
        team: "Team collaboration",
        analytics: "Advanced tools",
      },
    },
  ];

  return (
    <div className="diff-comparison-table">
      <h2>Architect Subscription Plans Comparison</h2>
      <table className="diff-table">
        <thead>
          <tr className="diff-row">
            <th className="diff-th">Feature</th>
            {plans.map((plan) => (
              <th className="diff-th" key={plan.name}>
                <h3>{plan.name}</h3>
                <p className="diff-description">{plan.description}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="diff-row">
            <td className="diff-td">Project Uploads</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.projects}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Marketplace Products</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.marketplace}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Client Management</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.clients}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Quotes & Invoices</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.quotesInvoices}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Dashboard Access</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.dashboard}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Recommendation Priority</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.recommendation}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Team Collaboration</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.team}
              </td>
            ))}
          </tr>
          <tr className="diff-row">
            <td className="diff-td">Analytics & Tools</td>
            {plans.map((plan) => (
              <td className="diff-td" key={plan.name}>
                {plan.features.analytics}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Diff;
