import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import logo from "../assets/autovaultlogo.png";
import { useUserProfile } from "../hooks/useProfilePage";

const navItems = [
  { name: "Home", path: "/home" },
  { name: "My Bookings", path: "/mybooking" },
  { name: "Saved Vehicles", path: "/savedvehicle" },
  { name: "About Us", path: "/about" },
  { name: "Profile", path: "/profile" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: userData } = useUserProfile();
  const navigate = useNavigate();

  // Build the correct URL for the profile picture
  const getProfilePicUrl = () => {
    if (!userData?.profilePic) return null;
    if (userData.profilePic.startsWith('http')) return userData.profilePic;

    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api";
    const serverRoot = apiBase.replace(/\/api\/?$/, "");
    return `${serverRoot}/uploads/${userData.profilePic}`;
  };

  const profilePicUrl = getProfilePicUrl();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center group">
          <img
            src={logo}
            alt="AutoVault Logo"
            className="h-16 w-auto transition-all duration-300 group-hover:scale-105"
          />
        </NavLink>

        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-10 text-sm font-semibold">
          {navItems.map(({ name, path }) => (
            <li key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? "text-primary relative tracking-wide"
                    : "text-slate-600 hover:text-primary transition-all duration-300 tracking-wide"
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-2">
                    {name === "Profile" && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {profilePicUrl ? (
                          <img src={profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={14} className="text-slate-400" />
                        )}
                      </div>
                    )}
                    <span>{name}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                    )}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find your perfect ride..."
              className="border border-slate-200 bg-slate-50 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white w-64 transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-4 h-4" />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-full px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
          >
            Search
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-primary focus:outline-none rounded-lg transition-all duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-100 px-6 py-6 space-y-6 animate-fadeInUp">
          <ul className="flex flex-col space-y-4 text-sm font-semibold">
            {navItems.map(({ name, path }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary flex items-center space-x-3"
                      : "text-slate-600 hover:text-primary transition-all duration-300 flex items-center space-x-3"
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${path === window.location.pathname ? 'bg-primary' : 'bg-slate-200'}`}></span>
                  <span>{name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-col space-y-3 pt-4 border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search vehicles..."
                className="w-full border border-slate-200 bg-slate-50 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-bold shadow-md active:scale-95 transition-all"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
