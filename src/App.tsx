import React, { useState, useEffect } from "react";
import { 
  Play, Info, ArrowLeft, ArrowRight, Star, Clock, Calendar, Volume2, Sparkles, AlertCircle 
} from "lucide-react";

import { DIVINITIES } from "./data";
import { Header } from "./components/Header";
import { SearchModal } from "./components/SearchModal";
import { LearnMorePanel } from "./components/LearnMorePanel";
import { WatchNowModal } from "./components/WatchNowModal";
import { ProfileModal } from "./components/ProfileModal";

export default function App() {
  // Navigation & carousel
  const [activeId, setActiveId] = useState("bapusa");
  const activeIdx = DIVINITIES.findIndex((d) => d.id === activeId);
  const activeDivinity = DIVINITIES[activeIdx >= 0 ? activeIdx : 0];

  // Interactivity modals triggers
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [learnMoreTab, setLearnMoreTab] = useState("about");
  const [watchOpen, setWatchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Parallax backdrop coordinate states
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Spiritual metrics loaded from localStorage
  const [streakCount, setStreakCount] = useState(0);
  const [totalMeditationMinutes, setTotalMeditationMinutes] = useState(0);

  // Success completed toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Load spiritual stats on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem("bus_presents_streak") || "0";
    const savedMinutes = localStorage.getItem("bus_presents_total_minutes") || "0";
    setStreakCount(parseInt(savedStreak, 10));
    setTotalMeditationMinutes(parseInt(savedMinutes, 10));

    // Verify streak and init if empty
    if (savedStreak === "0") {
      localStorage.setItem("bus_presents_streak", "1");
      setStreakCount(1);
    }
  }, []);

  // 2. Mousemove handler for smooth cinematic backdrop parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized offsets (-5px to 5px range)
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setCoords({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Slide previous/next helper
  const handlePrev = () => {
    const nextIdx = (activeIdx - 1 + DIVINITIES.length) % DIVINITIES.length;
    setActiveId(DIVINITIES[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (activeIdx + 1) % DIVINITIES.length;
    setActiveId(DIVINITIES[nextIdx].id);
  };

  // Direct selection from search matches
  const handleSelectFromResult = (id: string, matchedSection?: string) => {
    setActiveId(id);
    if (matchedSection) {
      if (matchedSection === "story") {
        setLearnMoreTab("stories");
        setLearnMoreOpen(true);
      } else if (matchedSection === "mantra") {
        setLearnMoreTab("mantras");
        setLearnMoreOpen(true);
      } else {
        setLearnMoreTab("about");
        setLearnMoreOpen(true);
      }
    }
  };

  // Increment meditation score stats when session completes inside watcher
  const handleLogMeditationComplete = (mins: number) => {
    // 1. Update total minutes
    const nextMinutes = totalMeditationMinutes + mins;
    setTotalMeditationMinutes(nextMinutes);
    localStorage.setItem("bus_presents_total_minutes", nextMinutes.toString());

    // 2. Update stats streak safely
    const statsStr = localStorage.getItem("bus_presents_last_session_date") || "";
    const todayStr = new Date().toDateString();
    
    let nextStreak = streakCount;
    if (statsStr !== todayStr) {
      nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      localStorage.setItem("bus_presents_streak", nextStreak.toString());
      localStorage.setItem("bus_presents_last_session_date", todayStr);
    }

    // 3. Fire cinematic toast
    setToastMessage(`Spiritual Union Complete! Logged +${mins} minutes with ${activeDivinity.name}. Daily Streak: ${nextStreak} Days!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  return (
    <div id="app-root-canvas" className="min-h-screen bg-[#141313] text-[#e5e2e1] font-sans selection:bg-white/20 select-none overflow-x-hidden relative flex flex-col justify-between">
      
      {/* CINEMATIC BACKDROP LAYOUT */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Underlay Poster or Video wrapper with parallax scale shift */}
        <div 
          className="w-full h-full object-cover transition-transform duration-700 ease-out absolute inset-0"
          style={{
            transform: `scale(1.05) translate(${coords.x}px, ${coords.y}px)`,
          }}
        >
          {activeDivinity.videoUrl ? (
            <video
              id="bg-ambient-video"
              src={activeDivinity.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover select-none pointer-events-none"
              key={activeDivinity.id} // Re-bind on change to reload video
            />
          ) : (
            <img
              id="bg-ambient-image"
              src={activeDivinity.backdropUrl}
              alt={activeDivinity.title}
              className="w-full h-full object-cover select-none pointer-events-none brightness-60 transition-opacity"
            />
          )}

          {/* Fallback dark tint to assure contrast holds */}
          <div className="absolute inset-0 bg-[#141313]/35" />
        </div>

        {/* Liquid Glass Overlay - Backdrop blur with gradient mask */}
        <div className="absolute inset-0 z-[1] backdrop-blur-xl bottom-blur-overlay pointer-events-none bg-gradient-to-t from-[#141313] via-transparent to-transparent opacity-95" />

        {/* Centered Apparition overlay image fused with radial background */}
        {activeDivinity.apparitionUrl && (
          <div 
            id={`apparition-${activeDivinity.id}`}
            className="absolute inset-0 z-2 flex items-center justify-center animate-blur-fade-up pointer-events-none"
            style={{ 
              animationDelay: "300ms",
              transform: `translate(${coords.x * -0.7}px, ${coords.y * -0.7}px)` // counter-parallax for depth!
            }}
          >
            <img
              src={activeDivinity.apparitionUrl}
              alt="Divine Manifestation"
              className="h-[75vh] w-auto max-w-[90vw] object-contain opacity-35 mix-blend-screen select-none select-none select-none"
              style={{
                maskImage: "radial-gradient(circle, black 35%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(circle, black 35%, transparent 75%)"
              }}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* HEADER SECTION SHIPPING */}
      <Header
        divinities={DIVINITIES}
        activeId={activeId}
        onSelectDivinity={(id) => {
          setActiveId(id);
          setLearnMoreOpen(false);
        }}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* COMPLETED CELESTIAL TOAST */}
      {toastMessage && (
        <div 
          id="toast-indicator"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-[#141313]/90 backdrop-blur-2xl rounded-2xl border border-white/20 text-white text-xs font-bold font-mono tracking-tight shadow-2xl flex items-center gap-3 animate-blur-fade-up"
        >
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center border border-white/20 animate-spin">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN LAYOUT CANVAS */}
      <main className="relative z-10 flex-1 flex flex-col justify-end pt-32 pb-8 px-6 md:px-16 md:pb-12 max-w-7xl mx-auto w-full">
        
        {/* Core details & information space */}
        <div className="max-w-4xl select-text">
          
          {/* Metadata info badges row */}
          <div 
            id="metadata-badge-row"
            className="flex flex-wrap items-center gap-4 mb-4 md:mb-5 animate-blur-fade-up select-none"
            style={{ animationDelay: "200ms" }}
          >
            {/* IMDb Badge */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 select-none">
              <Star className="h-3.5 w-3.5 text-[#FFB800] fill-[#FFB800] stroke-none" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white font-mono mt-0.5">
                IMDB {activeDivinity.rating}
              </span>
            </div>

            {/* Duration Badge */}
            <div className="flex items-center gap-1.5 text-[#c4c7c8]/85 select-none text-xs">
              <Clock className="h-4 w-4" />
              <span className="font-sans font-medium tracking-wide mt-0.5">{activeDivinity.duration}</span>
            </div>

            {/* Calendar Release date Badge */}
            <div className="flex items-center gap-1.5 text-[#c4c7c8]/85 select-none text-xs">
              <Calendar className="h-4 w-4" />
              <span className="font-sans font-medium tracking-wide mt-0.5">{activeDivinity.relDate}</span>
            </div>
          </div>

          {/* Full Display Title Heading */}
          <h1 
            id="divinity-display-title"
            className="font-sans font-black text-4xl sm:text-5xl md:text-[76px] leading-[0.92] mb-6 text-white tracking-tighter uppercase uppercase hover:opacity-95 transition-opacity select-text select-text"
          >
            {activeDivinity.title}
          </h1>

          {/* Cinematic details short description */}
          <p 
            id="divinity-short-description"
            className="font-sans text-[#c4c7c8] text-base md:text-lg max-w-2xl leading-relaxed mb-8 md:mb-10 selection:bg-white/20 select-text"
          >
            {activeDivinity.description}
          </p>

          {/* CTA Action Controls buttons row */}
          <div 
            id="cta-buttons-row"
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12 select-none"
          >
            <button
              id="primary-watch-button"
              onClick={() => setWatchOpen(true)}
              className="group relative px-8 py-4.5 bg-white text-[#141313] hover:bg-white/94 rounded-2xl font-sans font-black tracking-wide text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-103 active:scale-97 cursor-pointer shadow-xl select-none focus:outline-none"
            >
              <Play className="h-5 w-5 fill-current stroke-none transition-transform group-hover:scale-110" />
              Watch Now
            </button>

            <button
              id="secondary-info-button"
              onClick={() => {
                setLearnMoreTab("about");
                setLearnMoreOpen(true);
              }}
              className="liquid-glass px-8 py-4.5 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2.5 hover:scale-102 transition-all cursor-pointer select-none focus:outline-none"
            >
              <Info className="h-4 w-4" />
              Learn More
            </button>
          </div>
        </div>

        {/* BOTTOM PAGINATION & OVERVIEW SLIDER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-4 select-none">
          
          {/* Horizontal mini scrolling slider library */}
          <div className="flex-1 max-w-xl md:max-w-2xl">
            <span className="text-[10px] tracking-widest text-white/35 font-mono uppercase block mb-3.5">
              Available Celestial Streams
            </span>
            
            {/* Horizontally scrolling list cards */}
            <div className="flex gap-4.5 overflow-x-auto pb-2 pr-4 hide-scrollbar snap-x">
              {DIVINITIES.map((d) => (
                <button
                  key={d.id}
                  id={`carousel-thumbnail-${d.id}`}
                  onClick={() => {
                    setActiveId(d.id);
                    setLearnMoreOpen(false);
                  }}
                  className={`flex-shrink-0 w-32 md:w-36 aspect-[16/10] rounded-xl relative overflow-hidden text-left border cursor-pointer transition-all snap-start ${
                    activeId === d.id 
                      ? "border-white/50 scale-102 bg-white/10" 
                      : "border-white/5 hover:border-white/20 bg-white/2 hover:scale-101"
                  }`}
                >
                  {/* Backdrop tint of card */}
                  <img
                    src={d.backdropUrl}
                    alt={d.name}
                    className="w-full h-full object-cover opacity-35"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[8px] font-mono text-[#FFB800] uppercase tracking-wider font-bold mb-0.5 flex items-center gap-0.5">
                      ★ {d.rating}
                    </span>
                    <span className="text-[10px] font-bold text-white tracking-tight uppercase line-clamp-1">
                      {d.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Circular pagination buttons controls */}
          <div 
            id="pagination-buttons"
            className="flex items-center gap-3 self-end animate-blur-fade-up" 
            style={{ animationDelay: "500ms" }}
          >
            <button
              id="carousel-arrow-prev"
              onClick={handlePrev}
              className="liquid-glass w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center group cursor-pointer active:scale-92 focus:outline-none text-white"
              title="Previous Divinity"
            >
              <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-1.5 transition-transform" />
            </button>
            <button
              id="carousel-arrow-next"
              onClick={handleNext}
              className="liquid-glass w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center group cursor-pointer active:scale-92 focus:outline-none text-white"
              title="Next Divinity"
            >
              <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* RIGHT SIDE FIXED Coming Soon ANCHOR DECORATION */}
      <div className="fixed right-6 md:right-16 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-20 select-none">
        <div className="flex flex-col items-center gap-4">
          <span className="[writing-mode:vertical-lr] text-[10px] font-mono text-[#c4c7c8]/35 uppercase tracking-[0.25em] font-semibold select-none">
            STREAMING SOON
          </span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-white/15 to-transparent shadow" />
        </div>
      </div>

      {/* SEARCH MODAL CONTAINER */}
      <SearchModal
        divinities={DIVINITIES}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectDivinity={handleSelectFromResult}
      />

      {/* LEARN MORE SLIDE-OUT PANEL */}
      <LearnMorePanel
        divinity={activeDivinity}
        isOpen={learnMoreOpen}
        onClose={() => setLearnMoreOpen(false)}
        initialTab={learnMoreTab}
      />

      {/* IMMERSIVE WATCH NOW MEDITATION PORTAL */}
      <WatchNowModal
        divinity={activeDivinity}
        isOpen={watchOpen}
        onClose={() => setWatchOpen(false)}
        onIncreaseStreak={handleLogMeditationComplete}
      />

      {/* PROFILE STATS LOGS CENTER */}
      <ProfileModal
        divinities={DIVINITIES}
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        streakCount={streakCount}
        totalMeditationMinutes={totalMeditationMinutes}
      />
    </div>
  );
}
