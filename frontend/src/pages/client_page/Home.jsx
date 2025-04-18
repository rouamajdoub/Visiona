import React, { useState } from "react";
import Header from "./Global/Header";
import Projects from "./ProjectListingPage";
const Home = () => {
  const [showProject, setshowProject] = useState(true);

  const handleNavClick = () => {
    setshowProject(true);
  };

  return (
    <>
      <Header onNavClick={handleNavClick} />
      {showProject && <Projects />}
    </>
  );
};

export default Home;
