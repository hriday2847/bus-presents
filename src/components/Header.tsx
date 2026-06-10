import React, { useState } from "react";
import { Search, User, Menu, X } from "lucide-react";
import { Divinity } from "../types";

interface HeaderProps {
  divinities: Divinity[];
  activeId: string;
  onSelectDivinity: (id: string) => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}

export function Header({
  divinities,
  activeId,
  onSelectDivinity,
  onOpenSearch,
  onOpenProfile,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <nav 
        id="app-header"
        className="fixed top-0 w-full z-45 border-b border-white/5 flex justify-between items-center px-6 md:px-16 h-20 bg-[#141313]/40 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center gap-12">
          {/* Logo Brand */}
          <a 
            id="brand-logo"
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onSelectDivinity(divinities[0].id);
            }}
            className="font-sans font-black text-2xl md:text-3xl tracking-tighter text-white uppercase select-none hover:opacity-90 active:scale-98 transition-all"
          >
            BUS PRESENTS
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {divinities.map((d) => (
              <button
                key={d.id}
                id={`nav-link-${d.id}`}
                onClick={() => onSelectDivinity(d.id)}
                className={`text-sm tracking-wider font-semibold uppercase hover:text-white transition-all cursor-pointer py-1 relative ${
                  activeId === d.id 
                    ? "text-white font-bold" 
                    : "text-[#c4c7c8]/75"
                }`}
              >
                {d.name}
                {activeId === d.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* "Search" Button with liquid glass styling */}
          <button
            id="search-trigger"
            onClick={onOpenSearch}
            className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 group cursor-pointer"
          >
            <Search className="h-4 w-4 text-white group-hover:scale-115 transition-transform" />
            <span className="hidden md:block text-xs font-sans font-medium text-white/80">Search...</span>
          </button>

          {/* "Profile/Stats" Button */}
          <button
            id="profile-trigger"
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer overflow-hidden text-white"
            title="Spiritual Profile & Logs"
          >
            <User className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Mobile hamburger menu */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Responsive Navigation) */}
      {mobileMenuOpen && (
        <div 
          id="mobile-drawer"
          className="fixed inset-0 z-40 bg-[#141313]/95 backdrop-blur-2xl lg:hidden flex flex-col justify-center items-center gap-8 animate-fade-in"
        >
          <div className="text-white text-xs uppercase tracking-widest text-[#9ca3af] mb-4">Select Celestial Journey</div>
          {divinities.map((d) => (
            <button
              key={d.id}
              id={`mobile-nav-${d.id}`}
              onClick={() => {
                onSelectDivinity(d.id);
                setMobileMenuOpen(false);
              }}
              className={`text-2xl font-bold tracking-wider uppercase transition-all ${
                activeId === d.id 
                  ? "text-white scale-110" 
                  : "text-[#9ca3af]/60"
              }`}
            >
              {d.name}
            </button>
          ))}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="mt-8 liquid-glass px-6 py-2 rounded-full text-xs text-white uppercase tracking-wider font-semibold flex items-center gap-2"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      )}
    </>
  );
}
