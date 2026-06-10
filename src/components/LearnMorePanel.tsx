import React, { useState, useEffect } from "react";
import { 
  X, BookOpen, Music, Heart, FileText, Plus, Trash2, Calendar, Star, Sparkles, CheckCircle2 
} from "lucide-react";
import { Divinity, JournalEntry, DivinityReview } from "../types";

interface LearnMorePanelProps {
  divinity: Divinity;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export function LearnMorePanel({
  divinity,
  isOpen,
  onClose,
  initialTab = "about",
}: LearnMorePanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  
  // Mantra Chant Counter
  const [chantCounts, setChantCounts] = useState<Record<string, number>>({});
  const [visualRipple, setVisualRipple] = useState<Record<string, boolean>>({});

  // Journal State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  
  // Reviews State
  const [reviews, setReviews] = useState<DivinityReview[]>([]);
  const [submitterName, setSubmitterName] = useState("");
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Update active tab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, divinity]);

  // Read journal entries, chant counts and reviews from localStorage on render
  useEffect(() => {
    if (isOpen) {
      // Journal entries
      const savedJournal = localStorage.getItem(`bus_presents_journal_${divinity.id}`);
      if (savedJournal) {
        setJournalEntries(JSON.parse(savedJournal));
      } else {
        setJournalEntries([]);
      }

      // Chant counts
      const savedChants = localStorage.getItem(`bus_presents_chants_${divinity.id}`);
      if (savedChants) {
        setChantCounts(JSON.parse(savedChants));
      } else {
        setChantCounts({});
      }

      // Reviews/Devotee messages
      const savedReviews = localStorage.getItem(`bus_presents_reviews_${divinity.id}`);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        // Fallback reviews defaults
        const defaults = [
          {
            id: `${divinity.id}-review-1`,
            divinityId: divinity.id,
            user: "Sanjay Sharma",
            stars: 5,
            content: `The stories of ${divinity.name} inspire absolute hope. Highly recommended for daily visual reflection!`,
            date: "3 days ago"
          },
          {
            id: `${divinity.id}-review-2`,
            divinityId: divinity.id,
            user: "Meera Krishnan",
            stars: 5,
            content: `Chanting with the Solfeggio setting on this streaming console is extremely soothing. Direct route to peace.`,
            date: "Yesterday"
          }
        ];
        localStorage.setItem(`bus_presents_reviews_${divinity.id}`, JSON.stringify(defaults));
        setReviews(defaults);
      }

      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, divinity]);

  if (!isOpen) return null;

  // Save journal entries helper
  const saveJournal = (entries: JournalEntry[]) => {
    setJournalEntries(entries);
    localStorage.setItem(`bus_presents_journal_${divinity.id}`, JSON.stringify(entries));
  };

  // Add a brand new journal entry
  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      divinityId: divinity.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [entry, ...journalEntries];
    saveJournal(updated);
    setNewTitle("");
    setNewContent("");
  };

  // Delete a journal entry
  const handleDeleteJournal = (id: string) => {
    const updated = journalEntries.filter((e) => e.id !== id);
    saveJournal(updated);
  };

  // Increate Chant Count with visual feedback animation and store in localStorage
  const handleChant = (mantraText: string) => {
    // Visual ripple toggle
    setVisualRipple((prev) => ({ ...prev, [mantraText]: true }));
    setTimeout(() => {
      setVisualRipple((prev) => ({ ...prev, [mantraText]: false }));
    }, 400);

    const updated = {
      ...chantCounts,
      [mantraText]: (chantCounts[mantraText] || 0) + 1,
    };
    setChantCounts(updated);
    localStorage.setItem(`bus_presents_chants_${divinity.id}`, JSON.stringify(updated));

    // Also update overall stats in localStorage for profile page!
    const statsStr = localStorage.getItem("bus_presents_total_chants") || "0";
    const totalCount = parseInt(statsStr, 10) + 1;
    localStorage.setItem("bus_presents_total_chants", totalCount.toString());
  };

  // Reset Chant Count for specific mantra
  const resetChant = (mantraText: string) => {
    const updated = {
      ...chantCounts,
      [mantraText]: 0,
    };
    setChantCounts(updated);
    localStorage.setItem(`bus_presents_chants_${divinity.id}`, JSON.stringify(updated));
  };

  // Submit Review/Testimonial
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitterName.trim() || !reviewText.trim()) return;

    const newRev: DivinityReview = {
      id: Date.now().toString(),
      divinityId: divinity.id,
      user: submitterName.trim(),
      stars: ratingStars,
      content: reviewText.trim(),
      date: "Just now"
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem(`bus_presents_reviews_${divinity.id}`, JSON.stringify(updated));
    setSubmitterName("");
    setReviewText("");
  };

  return (
    <div 
      id="learn-panel-backdrop"
      className="fixed inset-0 z-48 bg-[#000000]/82 backdrop-blur-xl flex justify-end transition-all duration-500 animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="learn-panel-container"
        className="w-full max-w-2xl bg-[#141313]/90 backdrop-blur-2xl h-full border-l border-white/10 flex flex-col pt-6 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Metadata */}
        <div className="px-6 md:px-8 pb-5 border-b border-white/5 flex justify-between items-start">
          <div className="mr-8">
            <span className="text-[10px] font-bold tracking-widest text-[#FFB800] uppercase font-mono flex items-center gap-1.5 mb-1.5 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" /> Divine Portal Active
            </span>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">{divinity.title}</h2>
            <p className="text-xs text-[#c4c7c8]/80 mt-1 max-w-md">{divinity.subtitle}</p>
          </div>
          
          <button
            id="close-panel-button"
            onClick={onClose}
            className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer text-[#c4c7c8] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls Navigation */}
        <div className="flex border-b border-white/5 bg-[#141313]/60 px-4 md:px-6 py-2 overflow-x-auto hide-scrollbar gap-1">
          {[
            { id: "about", label: "Divine Chronicle", icon: FileText },
            { id: "stories", label: "Sacred Stories", icon: BookOpen },
            { id: "mantras", label: "Mantras & Chants", icon: Music },
            { id: "journal", label: "Reflection Journal", icon: Heart },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setExpandedStory(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                  isActive 
                    ? "bg-white text-[#141313] shadow-md scale-102 font-bold" 
                    : "text-[#c4c7c8]/70 hover:text-white bg-white/3 hover:bg-white/5"
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div id="panel-scroll-container" className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
          {/* TAB 1: About */}
          {activeTab === "about" && (
            <div id="tab-content-about" className="space-y-6 animate-blur-fade-up">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#9ca3af]/60 font-mono mb-2">Introduction</h4>
                <p className="text-sm font-sans text-[#e5e2e1] leading-relaxed select-text">
                  {divinity.about}
                </p>
              </div>

              {/* Specs Badge Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-white/40 mb-1">IMDDB Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-[#FFB800] fill-[#FFB800]" />
                    <span className="text-sm font-bold text-white leading-none font-mono mt-0.5">{divinity.rating}/10</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-white/40 mb-1">Chant Pitch</span>
                  <span className="text-sm font-bold text-white leading-none font-mono">{divinity.sound.frequency} Hz</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-white/40 mb-1">Cosmic Release</span>
                  <span className="text-sm font-bold text-white leading-none font-mono">{divinity.relDate}</span>
                </div>
              </div>

              <div className="h-[1px] bg-white/5 w-full my-6"></div>

              {/* Devotional Testimonials / Reviews Section */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#9ca3af]/60 font-mono mb-4">Devoted Testimonials</h4>
                
                {/* Submit New Testimonial Form */}
                <form onSubmit={handleSubmitReview} className="bg-white/2 border border-white/5 p-4 rounded-2xl mb-6 space-y-3">
                  <span className="text-xs font-semibold text-white/80 block">Add Your Devotional Review / Experience</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      className="bg-white/3 rounded-xl border border-white/5 px-3 py-2 text-xs focus:ring-1 focus:ring-white focus:outline-none text-white w-full"
                      required
                    />
                    <select
                      value={ratingStars}
                      onChange={(e) => setRatingStars(Number(e.target.value))}
                      className="bg-white/3 rounded-xl border border-white/5 px-3 py-2 text-xs focus:ring-1 focus:ring-white focus:outline-none text-white w-full"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                      <option value="3">⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="Write details of your experience, blessing or prayer requests..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={2}
                    className="bg-white/3 rounded-xl border border-white/5 px-3 py-2 text-xs focus:ring-1 focus:ring-white focus:outline-none text-white w-full resize-none"
                    required
                  ></textarea>
                  <button 
                    type="submit"
                    className="w-full bg-white text-[#141313] hover:bg-white/90 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post My Devotement
                  </button>
                </form>

                <div className="space-y-3.5">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-white/5 bg-white/2 space-y-1.5 transition-colors hover:bg-white/3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{rev.user}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/40">{rev.date}</span>
                          <span className="text-xs font-semibold text-[#FFB800] font-mono">{"★".repeat(rev.stars)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#c4c7c8]/85 leading-relaxed italic select-text">
                        "{rev.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sacred Stories (Interactive Accordion) */}
          {activeTab === "stories" && (
            <div id="tab-content-stories" className="space-y-4 animate-blur-fade-up">
              <p className="text-xs text-[#9ca3af]/60 font-mono uppercase tracking-widest mb-4">Historical Divinities chronicles</p>
              
              {divinity.stories.map((story, idx) => {
                const isExpanded = expandedStory === idx;
                return (
                  <div 
                    key={idx}
                    id={`story-card-${idx}`}
                    className={`rounded-2xl transition-all duration-300 border ${
                      isExpanded 
                        ? "bg-white/5 border-white/20 shadow-lg scale-101" 
                        : "bg-white/2 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedStory(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/35 font-bold">0{idx + 1}.</span>
                        <h4 className="text-sm font-bold text-white tracking-tight">{story.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-white/40 group-hover:text-white">
                        {isExpanded ? "Collapse" : "Read Story"}
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-white/5 select-text">
                        <p className="text-xs text-[#c4c7c8] leading-relaxed font-sans first-letter:text-xl first-letter:font-bold first-letter:text-white">
                          {story.description}
                        </p>
                        <div className="bg-white/2 p-3 rounded-xl border border-white/5 mt-3 text-[10px] text-white/40 font-mono leading-relaxed">
                          🛡️ Lessons: This historic event showcases the power of pure spiritual intention, faith, and patience. Devotees recite this daily to build inner resilience.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Mantras & Chants */}
          {activeTab === "mantras" && (
            <div id="tab-content-mantras" className="space-y-5 animate-blur-fade-up">
              <div className="text-center bg-white/2 p-5 rounded-3xl border border-white/5 mb-2 select-none">
                <span className="text-[10px] uppercase tracking-widest text-white/40 block font-mono mb-2">Sacred Solfeggio Tuning</span>
                <span className="text-2xl font-black text-white font-mono">{divinity.sound.frequency} Hz</span>
                <p className="text-xs text-[#9ca3af]/80 mt-1.5 max-w-sm mx-auto">{divinity.sound.description}</p>
              </div>

              <p className="text-xs text-[#9ca3af]/60 font-mono uppercase tracking-widest mb-1 pl-1">Chanting & Meditation guides</p>

              {divinity.mantras.map((mantra, idx) => {
                const count = chantCounts[mantra.text] || 0;
                const isRippling = visualRipple[mantra.text];
                return (
                  <div 
                    key={idx}
                    id={`mantra-box-${idx}`}
                    className="p-5 bg-white/2 border border-white/5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-white/10"
                  >
                    {/* Visual ripple layer on click */}
                    {isRippling && (
                      <div className="absolute inset-0 bg-white/5 animate-pulse rounded-2xl pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-3 select-text">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold tracking-widest text-[#FFB800] uppercase font-mono bg-white/3 px-2 py-0.5 rounded">
                          Mantra 0{idx + 1}
                        </span>
                        <h4 className="text-base font-black text-white tracking-widest pt-1 leading-normal font-sans">
                          {mantra.text}
                        </h4>
                        <p className="text-xs text-white/55 leading-relaxed font-sans mt-1">
                          "{mantra.translation}"
                        </p>
                      </div>
                    </div>

                    {/* Chant Counter Action Row */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-4 select-none">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-mono">Completed Chants</span>
                        <span className="text-lg font-black text-white font-mono leading-none mt-1">
                          {count} <span className="text-xs text-white/30 font-medium font-sans">/ 108</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <button
                            onClick={() => resetChant(mantra.text)}
                            className="text-[10px] text-white/40 hover:text-white uppercase font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          onClick={() => handleChant(mantra.text)}
                          className="px-5 py-2 rounded-xl bg-white text-[#141313] hover:bg-white/90 text-xs font-mono font-bold tracking-wide active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-1"
                        >
                          🙏 CHANT
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: Reflection Journal */}
          {activeTab === "journal" && (
            <div id="tab-content-journal" className="space-y-6 animate-blur-fade-up">
              <div>
                <p className="text-xs text-[#9ca3af]/60 font-mono uppercase tracking-widest pl-1 mb-3">Daily Reflection & Intention</p>
                
                {/* Journal formulation */}
                <form id="journal-input-form" onSubmit={handleAddJournal} className="bg-white/2 border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-wider font-mono">Title of Contemplation</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Gratitude for Health, Serene Mind request..." 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white/3 rounded-xl border border-white/5 px-4 py-2.5 text-xs focus:ring-1 focus:ring-white focus:outline-none text-white"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#c4c7c8] uppercase tracking-wider font-mono">Your Reflection / Prayer Note</label>
                    <textarea 
                      placeholder="Write your conversation with God, divine resolutions, or meditation learnings..." 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={3}
                      className="w-full bg-white/3 rounded-xl border border-white/5 p-4 text-xs focus:ring-1 focus:ring-white focus:outline-none text-white resize-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-white text-[#141313] hover:bg-white/90 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="h-4 w-4" /> Save Prayer Note
                  </button>
                </form>
              </div>

              {/* Saved Notes List */}
              <div className="space-y-4">
                <span className="text-xs text-[#9ca3af]/60 font-mono uppercase tracking-widest pl-1 block">Your Saved Divine Logs ({journalEntries.length})</span>
                
                {journalEntries.length > 0 ? (
                  journalEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="p-5 rounded-2xl border border-white/5 bg-white/2 relative group transition-all duration-300 hover:border-white/10 select-text"
                    >
                      <button
                        onClick={() => handleDeleteJournal(entry.id)}
                        className="absolute right-4 top-4 text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Remove entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="space-y-1 pr-6">
                        <span className="text-[10px] font-mono text-white/40">{entry.timestamp}</span>
                        <h5 className="text-sm font-bold text-white tracking-tight leading-snug">{entry.title}</h5>
                        <p className="text-xs text-[#c4c7c8]/80 leading-relaxed pt-1.5 whitespace-pre-wrap font-sans">
                          {entry.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-white/5 text-white/30 text-xs">
                    🧘 No reflection notes logged for {divinity.name} yet. Write your first one above!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
