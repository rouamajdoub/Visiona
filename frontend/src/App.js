import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard.jsx";
import ArchitectDashboard from "./pages/Dashboard/Architect/Main.jsx";
import Calender from "./pages/Dashboard/Architect/pages/Calendar/Calendar.jsx";
import { Pricing } from "./pages/subs_selection_page/Pricing.jsx";
import About from "./pages/About/HeroSlider.jsx";
import InteriorDesignTrends from "./pages/landing/trending/Trending.jsx";
import Policy from "./pages/landing/P-Policy/Policy.jsx";
//Client Pages
import Architect from "./pages/client_page/section/Architect/Architect.jsx";
import FAv from "./pages/client_page/section/Fav/FAv.jsx";
import Clients from "./pages/client_page/Home.jsx";
import ArchitectD from "./pages/client_page/section/Architect/ArchitectD.jsx";
import ProjectD from "./pages/client_page/section/Projects/ProjectD.jsx";
import Account from "./pages/client_page/section/Account/Account.jsx";
function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/architect" element={<ArchitectDashboard />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/subs" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/architects" element={<Architect />} />
        <Route path="/my-favorites" element={<FAv />} />
        <Route path="/architect-details" element={<ArchitectD />} />
        <Route path="/projects-details" element={<ProjectD />} />
        <Route path="/project_showcase" element={<Clients />} />
        <Route path="/trending" element={<InteriorDesignTrends />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Clients />} />
      </Routes>
    </>
  );
}

export default App;
