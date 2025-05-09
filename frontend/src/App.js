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
import Clients from "./pages/client_page/page/Home.jsx";
import NeedSheetForm from "./pages/client_page/Global/NeedSheetForm/NeedSheetForm.jsx";
import ClientPortal from "./pages/client_page/Global/account/ClientPortal.jsx";
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
        <Route path="/Home" element={<Clients />} />
        <Route path="/trending" element={<InteriorDesignTrends />} />
        <Route path="/needSheet" element={<NeedSheetForm />} />
        <Route path="/Profile" element={<ClientPortal />} />

        <Route path="*" element={<Clients />} />
      </Routes>
    </>
  );
}

export default App;
