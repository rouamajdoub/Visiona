import React, { createContext, useContext, useState } from "react";

// Create the context
const ArchitectContext = createContext();

// Custom hook to use the architect context
export const useArchitect = () => {
  const context = useContext(ArchitectContext);
  if (!context) {
    throw new Error("useArchitect must be used within an ArchitectProvider");
  }
  return context;
};

// Context Provider Component
export const ArchitectProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'profile'
  const [selectedArchitectId, setSelectedArchitectId] = useState(null);

  const showArchitectProfile = (architectId) => {
    setSelectedArchitectId(architectId);
    setCurrentView("profile");
  };

  const showArchitectList = () => {
    setCurrentView("list");
    setSelectedArchitectId(null);
  };

  return (
    <ArchitectContext.Provider
      value={{
        currentView,
        selectedArchitectId,
        showArchitectProfile,
        showArchitectList,
      }}
    >
      {children}
    </ArchitectContext.Provider>
  );
};
