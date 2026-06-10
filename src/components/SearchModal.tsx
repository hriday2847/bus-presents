import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronRight, Sparkles, BookOpen, Music } from "lucide-react";
import { Divinity } from "../types";

interface SearchModalProps {
  divinities: Divinity[];
  isOpen: boolean;
  onClose: () => void;
  onSelectDivinity: (id: string, viewSection?: string) => void;
}

export function SearchModal({
  divinities,
  isOpen,
  onClose,
  onSelectDivinity,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Search indexing logic
  const results: any[] = [];
  if (query.trim()) {
    const q = query.toLowerCase();
    divinities.forEach((d) => {
      // Check divinity name/title
      if (
        d.name.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.about.toLowerCase().includes(q)
      ) {
        results.push({
          type: "divinity",
          divinityId: d.id,
          divinityName: d.name,
          title: d.title,
          subtitle: d.subtitle,
          matchedText: d.subtitle,
        });
      }

      // Check stories
      d.stories.forEach((story) => {
        if (
          story.title.toLowerCase().includes(q) ||
          story.description.toLowerCase().includes(q)
        ) {
          results.push({
            type: "story",
            divinityId: d.id,
            divinityName: d.name,
            title: story.title,
            subtitle: `Sacred Story in ${d.name}`,
            matchedText: story.description,
          });
        }
      });

      // Check mantras
      d.mantras.forEach((mantra) => {
        if (
          mantra.text.toLowerCase().includes(q) ||
          mantra.translation.toLowerCase().includes(q)
        ) {
          results.push({
            type: "mantra",
            divinityId: d.id,
            divinityName: d.name,
            title: mantra.text,
            subtitle: `Sacred Mantra for ${d.name}`,
            matchedText: mantra.translation,
          });
        }
      });
    });
  }

  return (
    <div 
      id="search-backdrop"
      className="fixed inset-0 z-50 bg-[#0e0e0e]/90 backdrop-blur-2xl flex flex-col items-center pt-24 px-6 md:px-16"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-4 w-full mr-4">
            <Search className="h-6 w-6 text-white/50 flex-shrink-0" />
            <input
              ref={inputRef}
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sacred journeys, mantras, divine stories, or teachings..."
              className="bg-transparent border-none text-white text-lg md:text-xl font-sans w-full focus:outline-none placeholder-white/30"
            />
          </div>
          <button
            id="close-search-button"
            onClick={onClose}
            className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer text-white/70 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Suggestion tags if search is empty */}
        {!query.trim() ? (
          <div id="search-suggestions" className="animate-blur-fade-up">
            <p className="text-xs uppercase tracking-widest text-white/45 mb-4">Recommended Explorations</p>
            <div className="flex flex-wrap gap-3">
              {divinities.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelectDivinity(d.id);
                    onClose();
                  }}
                  className="liquid-glass hover:bg-white/10 text-white rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-white/60" />
                  {d.name}
                </button>
              ))}
            </div>
            
            <div className="mt-12 select-none border-l-2 border-white/5 pl-4">
              <h4 className="text-sm font-semibold text-white/80 mb-2">Infinite Cinematic Portals</h4>
              <p className="text-xs text-white/50 leading-relaxed max-w-md">
                Search matches elements across our whole spiritual system. You can type keywords like "nectar", "hills", "mantra", "fear", "protection" or "abundance" to find stories and practices directly.
              </p>
            </div>
          </div>
        ) : (
          /* Results list */
          <div id="search-results" className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
            <div className="text-xs uppercase tracking-widest text-[#9ca3af] mb-1">
              Found {results.length} {results.length === 1 ? "match" : "matches"}
            </div>
            
            {results.length > 0 ? (
              results.map((item, idx) => (
                <button
                  key={`${item.divinityId}-${item.type}-${idx}`}
                  onClick={() => {
                    onSelectDivinity(item.divinityId, item.type);
                    onClose();
                  }}
                  className="w-full text-left liquid-glass p-5 rounded-2xl flex items-center justify-between group cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4 mr-4">
                    {/* Prefix icon based on type */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 group-hover:bg-white/10 group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                      {item.type === "divinity" && <Sparkles className="h-4 w-4" />}
                      {item.type === "story" && <BookOpen className="h-4 w-4" />}
                      {item.type === "mantra" && <Music className="h-4 w-4" />}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase bg-white/5 px-2 py-0.5 rounded-md inline-block mb-1.5 font-mono">
                        {item.divinityName} • {item.type}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      {item.matchedText && (
                        <p className="text-xs text-white/50 leading-relaxed mt-1 line-clamp-2">
                          {item.matchedText}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))
            ) : (
              <div className="text-center py-12 bg-white/2 rounded-2xl border border-dashed border-white/5 text-white/40 text-sm">
                No matching spiritual content found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
