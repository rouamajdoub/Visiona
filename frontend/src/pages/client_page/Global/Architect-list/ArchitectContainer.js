import React from "react";
import { ArchitectProvider, useArchitect } from "./ArchitectContext";
import ArchitectList from "./ArchitectList";
import ArchitectProfile from "./ArchitectProfile";

// Internal container component that uses the context
const ArchitectContainer = () => {
  const { currentView } = useArchitect();

  return (
    <div className="architect-container">
      {currentView === "list" && <ArchitectList />}
      {currentView === "profile" && <ArchitectProfile />}
    </div>
  );
};

// Main wrapper component that provides context to the container
const ArchitectContainerWithProvider = () => {
  return (
    <ArchitectProvider>
      <ArchitectContainer />
    </ArchitectProvider>
  );
};

export default ArchitectContainerWithProvider;
