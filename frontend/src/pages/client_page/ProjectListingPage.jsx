import React from "react";
import "./ProjectListingPage.css";
import { FaHeart, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import Project from "./img/123.png";
const categories = ["category 1", "category 2", "category 3", "category 4"];
const tags = ["tag 1", "tag 2", "tag 3", "tag 4"];

const ProjectCard = () => (
  <div className="Prjt-card">
    <img src={Project} alt="Project" className="Prjt-image" />
    <div className="Prjt-info">
      <div>
        <p className="Prjt-architect-name">Architect Name</p>
        <p className="Prjt-budget">Budget</p>
      </div>
      <div className="Prjt-folan">folan</div>
    </div>
    <div className="Prjt-footer">
      <p className="Prjt-title">Project Title</p>
      <FaHeart className="Prjt-heart-icon" />
    </div>
  </div>
);

const Sidebar = () => (
  <div className="Prjt-sidebar">
    <h2 className="Prjt-sidebar-title">Recent projects</h2>
    <div className="Prjt-sidebar-section">
      <h3>Category</h3>
      {categories.map((cat, index) => (
        <div key={index} className="Prjt-checkbox-group">
          <input type="checkbox" defaultChecked={index === 0} />
          <label>{cat}</label>
        </div>
      ))}
    </div>
    <div className="Prjt-sidebar-section">
      <h3>Tags</h3>
      {tags.map((tag, index) => (
        <div key={index} className="Prjt-checkbox-group">
          <input type="checkbox" defaultChecked={index < 2} />
          <label>{tag}</label>
        </div>
      ))}
    </div>
    <div className="Prjt-sidebar-section">
      <h3>Budget Range</h3>
      <input type="range" min="0" max="10000" />
      <input type="range" min="10000" max="15000" />
    </div>
  </div>
);

export default function ProjectListingPage() {
  return (
    <div className="Prjt-page">
      <section className="Prjt-search-section">
        <p className="Prjt-search-heading">Find Your Perfect Match</p>
        <div className="Prjt-search-bar">
          <div className="Prjt-search-input">
            <FaSearch className="Prjt-search-icon" />
            <input type="text" placeholder="project category or keywords" />
          </div>
          <div className="Prjt-search-input">
            <FaMapMarkerAlt className="Prjt-search-icon" />
            <input type="text" placeholder="Enter Location" />
          </div>
          <button className="Prjt-search-button">Search</button>
        </div>
      </section>

      <main className="Prjt-main">
        <Sidebar />
        <div className="Prjt-grid">
          {Array(9)
            .fill(null)
            .map((_, index) => (
              <ProjectCard key={index} />
            ))}
        </div>
      </main>
    </div>
  );
}
