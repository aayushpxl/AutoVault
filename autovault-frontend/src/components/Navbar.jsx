import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import logo from "../assets/logo.png";

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
  const navigate = useNavigate();

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
    <nav className="fixed top-0 left-0 w-full bg-gradient-primary/95 backdrop-blur-xl border-b border-white/10 z-50 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center group">
          <img
            src={logo}
            alt="AutoVault Logo"
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </NavLink>

        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-8 text-sm font-medium">
          {navItems.map(({ name, path }) => (
            <li key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? "text-accent font-semibold border-b-2 border-accent pb-1 tracking-wide transition-all duration-300"
                    : "text-white/90 hover:text-accent transition-all duration-300 tracking-wide relative group"
                }
              >
                {name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search vehicles..."
              className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/15 w-64 transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-secondary text-white text-sm font-semibold rounded-full px-6 py-2.5 transition-all duration-300 transform hover:scale-105 hover:shadow-glow-orange"
          >
            Search
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg transition-all duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary/98 backdrop-blur-lg border-t border-white/10 px-6 py-6 space-y-5 animate-slideInLeft">
          <ul className="flex flex-col space-y-4 text-sm font-medium">
            {navItems.map(({ name, path }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "text-accent font-semibold flex items-center space-x-2"
                      : "text-white/90 hover:text-accent transition-all duration-300 flex items-center space-x-2"
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  <span>{name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search vehicles..."
                className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-secondary text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:shadow-glow-orange transition-all duration-300"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
