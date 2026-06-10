import React, { useState, useEffect } from "react";
import { 
  X, Award, Heart, ShieldAlert, BadgeCheck, ListTodo, HelpCircle, Compass, Flame, Timer, Music, Trash2, Milestone, ChevronRight, NotebookText 
} from "lucide-react";
import { MeditationSession, JournalEntry, Divinity } from "../types";

interface ProfileModalProps {
  divinities: Divinity[];
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  totalMeditationMinutes: number;
}

const AVATARS = [
  { id: "lotus", char: "🌸", name: "Lotus Heart" },
  { id: "mystic", char: "🌟", name: "Mystic Light" },
  { id: "mountain", char: "🏔️", name: "Seer of Hills" },
  { id: "infinity", char: "♾️", name: "Formless Seeker" },
];

export function ProfileModal({
  divinities,
  isOpen,
  onClose,
  streakCount,
  totalMeditationMinutes,
}: ProfileModalProps) {
  const [activeAvatar, setActiveAvatar] = useState("lotus");
  const [sessionLogs, setSessionLogs] = useState<MeditationSession[]>([]);
  const [totalChants, setTotalChants] = useState(0);
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      // 1. Load active avatar choice
      const savedAv = localStorage.getItem("bus_presents_avatar") || "lotus";
      setActiveAvatar(savedAv);

      // 2. Load session logs
      const savedLogsStr = localStorage.getItem("bus_presents_sessions") || "[]";
      const logs = JSON.parse(savedLogsStr) as MeditationSession[];
      // Sort descending
      setSessionLogs(logs.reverse());

      // 3. Load accumulated chant count
      const accumulatedChants = localStorage.getItem("bus_presents_total_chants") || "0";
      setTotalChants(parseInt(accumulatedChants, 10));

      // 4. Aggregate all journal entries across all divinities
      const aggregated: JournalEntry[] = [];
      divinities.forEach((d) => {
        const key = `bus_presents_journal_${d.id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const entries = JSON.parse(saved) as JournalEntry[];
          aggregated.push(...entries);
        }
      });
      
      // Sort aggregated journals by timestamp / ID
      aggregated.sort((a, b) => b.id.localeCompare(a.id));
      setAllJournalEntries(aggregated);

      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, divinities]);

  if (!isOpen) return null;

  const handleSelectAvatar = (avId: string) => {
    setActiveAvatar(avId);
    localStorage.setItem("bus_presents_avatar", avId);
  };

  const selectedAvatarObj = AVATARS.find((a) => a.id === activeAvatar) || AVATARS[0];

  // Helper to map divinity id to capitalized divinity name
  const getDeityName = (id: string) => {
    return divinities.find((d) => d.id === id)?.name || id.toUpperCase();
  };

  // Helper to clear all history
  const handleWipeHistory = () => {
    if (window.confirm("Are you sure you want to clear your spiritual meditation records and streak logs? This action is irreversible.")) {
      localStorage.removeItem("bus_presents_sessions");
      localStorage.removeItem("bus_presents_total_chants");
      localStorage.removeItem("bus_presents_streak");
      localStorage.removeItem("bus_presents_total_minutes");
      
      // Clear journal keys
      divinities.forEach((d) => {
        localStorage.removeItem(`bus_presents_journal_${d.id}`);
        localStorage.removeItem(`bus_presents_chants_${d.id}`);
      });

      // Reload
      setSessionLogs([]);
      setTotalChants(0);
      setAllJournalEntries([]);
      alert("Spiritual slate cleared successfully.");
      onClose();
      window.location.reload();
    }
  };

  return (
    <div 
      id="profile-panel-backdrop"
      className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-2xl flex justify-center items-center p-4 md:p-6 transition-all duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="profile-panel-container"
        className="w-full max-w-2xl bg-[#141313]/92 backdrop-blur-2xl max-h-[90vh] rounded-3xl border border-white/10 flex flex-col relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full blur-xl pointer-events-none" />

        {/* Top Header */}
        <div className="px-6 md:px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#141313]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-xl select-none shadow">
              {selectedAvatarObj.char}
            </div>
            <div>
              <h3 className="font-sans font-black text-lg text-white leading-tight uppercase tracking-tight">Your Devoted Sanctuary</h3>
              <p className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Seeker Records</p>
            </div>
          </div>

          <button
            id="close-profile-button"
            onClick={onClose}
            className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer text-[#c4c7c8] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Sandbox Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 hide-scrollbar select-text">
          
          {/* Avatar Selector segment */}
          <div className="space-y-2 select-none">
            <span className="text-[10px] tracking-widest text-[#9ca3af]/60 font-mono uppercase block">Choose Your Seeker Identity</span>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => {
                const isSelected = activeAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.id)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center border text-center cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-white/10 border-white/30 text-white font-bold" 
                        : "bg-white/2 border-white/5 hover:border-white/15 text-white/50 hover:text-white"
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.char}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold font-mono leading-none">{av.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Golden Stats Banner Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/3 to-white/1 border border-white/8 flex flex-col items-center justify-center text-center">
              <Flame className="h-5 w-5 text-white stroke-[2.5]" />
              <span className="text-[9px] text-[#9ca3af]/65 uppercase font-mono tracking-wider mt-2.5">Daily Streak</span>
              <span className="text-xl font-mono font-black text-white leading-tight mt-0.5">{streakCount} Days</span>
            </div>

            {/* Total Minutes */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/3 to-white/1 border border-white/8 flex flex-col items-center justify-center text-center">
              <Timer className="h-5 w-5 text-white stroke-[2.5]" />
              <span className="text-[9px] text-[#9ca3af]/65 uppercase font-mono tracking-wider mt-2.5">Total Silences</span>
              <span className="text-xl font-mono font-black text-white leading-tight mt-0.5">{totalMeditationMinutes} Mins</span>
            </div>

            {/* Chants */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/3 to-white/1 border border-white/8 flex flex-col items-center justify-center text-center">
              <Music className="h-5 w-5 text-white stroke-[2.5]" />
              <span className="text-[9px] text-[#9ca3af]/65 uppercase font-mono tracking-wider mt-2.5">Japa Counts</span>
              <span className="text-xl font-mono font-black text-white leading-tight mt-0.5">{totalChants} times</span>
            </div>
          </div>

          {/* Meditation History list */}
          <div className="space-y-3 select-none">
            <span className="text-[10px] tracking-widest text-[#9ca3af]/60 font-mono uppercase block">Session Audits Logs ({sessionLogs.length})</span>
            {sessionLogs.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 hide-scrollbar border border-white/5 rounded-2xl bg-white/2 p-3">
                {sessionLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2 rounded-xl bg-white/3 border border-white/3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white shadow" />
                      <div>
                        <span className="font-semibold text-white uppercase font-mono mr-1">{getDeityName(log.divinityId)}</span>
                        <span className="text-white/45">• Meditated</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-white/40 font-mono">{log.timestamp}</span>
                      <span className="font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded-md">+{log.durationMinutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl text-xs text-white/30">
                🌱 No meditation logs recorded yet. Sit in deep silence using "Watch Now".
              </div>
            )}
          </div>

          {/* Unified Diaries Index list */}
          <div className="space-y-3">
            <span className="text-[10px] tracking-widest text-[#9ca3af]/60 font-mono uppercase block">Collected Prayers Reflections ({allJournalEntries.length})</span>
            {allJournalEntries.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2 hide-scrollbar">
                {allJournalEntries.map((e) => (
                  <div key={e.id} className="p-4 rounded-2xl bg-white/2 border border-white/5 relative group hover:border-white/10 transition-colors">
                    <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase bg-white/10 px-2 py-0.5 rounded font-mono inline-block mb-1.5">
                      {getDeityName(e.divinityId)} • Reflections
                    </span>
                    <h5 className="text-xs font-black text-white leading-tight">{e.title}</h5>
                    <p className="text-[11px] text-[#c4c7c8]/80 leading-relaxed pt-1 select-text">
                      {e.content}
                    </p>
                    <span className="text-[8px] text-white/30 clock block text-right mt-1.5 leading-none font-mono">{e.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl text-xs text-white/30">
                📝 No journal reflections in sanctuary. Head into the "Learn More" panel to record a new reflection note!
              </div>
            )}
          </div>

          <div className="h-[1px] bg-white/5 w-full my-4"></div>

          {/* Reset button section */}
          <div className="pt-2 select-none">
            <button
              onClick={handleWipeHistory}
              className="w-full py-2.5 border border-red-900/40 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center block focus:outline-none"
            >
              ⚠️ Clears sanctuary records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
