import React, { useState, useEffect, useRef } from "react";
import { 
  X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Timer, Heart, Eye, Award 
} from "lucide-react";
import { Divinity, MeditationSession } from "../types";
import { ambientSynth } from "../utils/audio";

interface WatchNowModalProps {
  divinity: Divinity;
  isOpen: boolean;
  onClose: () => void;
  onIncreaseStreak: (duration: number) => void;
}

export function WatchNowModal({
  divinity,
  isOpen,
  onClose,
  onIncreaseStreak,
}: WatchNowModalProps) {
  // Sound controls
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [waveType, setWaveType] = useState<OscillatorType>("sine");
  const [pitchFreq, setPitchFreq] = useState(divinity.sound.frequency);
  const [volume, setVolume] = useState(0.25);
  
  // Timer states
  const [selectedDuration, setSelectedDuration] = useState(5); // in minutes
  const [secondsRemaining, setSecondsRemaining] = useState(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);

  // Breath & Mantra slider
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [selectedMantraIdx, setSelectedMantraIdx] = useState(0);

  // Drifting Star Particle generation
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; s: number; d: number }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate background particles when opened
  useEffect(() => {
    if (isOpen) {
      const list = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1.5 + Math.random() * 3, // size
        d: 5 + Math.random() * 15, // duration
      }));
      setParticles(list);
      
      // Sync initial pitch
      setPitchFreq(divinity.sound.frequency);
      setWaveType(divinity.sound.type);

      // Start synthesizer automatically if desired, otherwise gentle reminder
      // Best is to let user toggle explicitly but we can start smoothly!
      ambientSynth.play(divinity.sound.frequency, divinity.sound.type, volume);
      setIsPlayingSound(true);

      document.body.style.overflow = "hidden";
    } else {
      ambientSynth.stop();
      setIsPlayingSound(false);
      setIsTimerRunning(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      ambientSynth.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, divinity]);

  // Adjust frequencies if active divinity changes while open
  useEffect(() => {
    if (isOpen) {
      setPitchFreq(divinity.sound.frequency);
      setSecondsRemaining(selectedDuration * 60);
      setIsTimerCompleted(false);
      setIsTimerRunning(false);
      if (isPlayingSound) {
        ambientSynth.play(divinity.sound.frequency, waveType, volume);
      }
    }
  }, [divinity]);

  // Sync volume node
  useEffect(() => {
    if (isPlayingSound) {
      ambientSynth.setVolume(volume);
    }
  }, [volume, isPlayingSound]);

  // Sync pitch frequency and waves
  const handleFrequenceChange = (freq: number) => {
    setPitchFreq(freq);
    if (isPlayingSound) {
      ambientSynth.updateFrequency(freq);
    }
  };

  const handleWaveChange = (type: OscillatorType) => {
    setWaveType(type);
    if (isPlayingSound) {
      ambientSynth.play(pitchFreq, type, volume);
    }
  };

  const handleToggleSound = () => {
    if (isPlayingSound) {
      ambientSynth.stop();
      setIsPlayingSound(false);
    } else {
      ambientSynth.play(pitchFreq, waveType, volume);
      setIsPlayingSound(true);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      // Completed!
      setIsTimerRunning(false);
      setIsTimerCompleted(true);
      
      // Audio Chime (Gentle Synth trigger)
      try {
        ambientSynth.play(660, "sine", 0.4); // high sweet tone
        setTimeout(() => ambientSynth.play(880, "sine", 0.3), 150);
        setTimeout(() => {
          if (isPlayingSound) {
            ambientSynth.play(pitchFreq, waveType, volume);
          } else {
            ambientSynth.stop();
          }
        }, 1200);
      } catch (e) {}

      // Log the meditation session to localStorage for statistics
      const newSession: MeditationSession = {
        id: Date.now().toString(),
        divinityId: divinity.id,
        durationMinutes: selectedDuration,
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      const savedSessionsStr = localStorage.getItem("bus_presents_sessions") || "[]";
      const savedSessions = JSON.parse(savedSessionsStr);
      savedSessions.push(newSession);
      localStorage.setItem("bus_presents_sessions", JSON.stringify(savedSessions));

      onIncreaseStreak(selectedDuration);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, secondsRemaining]);

  // Change preset durations
  const handleSetDuration = (mins: number) => {
    setSelectedDuration(mins);
    setSecondsRemaining(mins * 60);
    setIsTimerRunning(false);
    setIsTimerCompleted(false);
  };

  // Breathing Guide Loop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "inhale") return "hold";
        if (prev === "hold") return "exhale";
        return "inhale";
      });
    }, 4000); // 4 seconds phase shift
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Format helper (e.g. 120 -> "02:00")
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Choose display text based on phase
  const getBreathLabel = () => {
    if (breathPhase === "inhale") return { text: "BREATHE IN", style: "text-[#c4c7c8] scale-105" };
    if (breathPhase === "hold") return { text: "HOLD & CONTEMPLATE", style: "text-white scale-110 font-bold" };
    return { text: "BREATHE OUT", style: "text-white/40 scale-95" };
  };

  return (
    <div 
      id="watch-overlay"
      className="fixed inset-0 z-50 bg-[#060606] select-none flex flex-col justify-between"
    >
      {/* Drifting particle background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white opacity-40 blur-[1px]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.s}px`,
              height: `${p.s}px`,
              animation: `drift ${p.d}s linear infinite alternate`,
            }}
          />
        ))}
        {/* Soft centered lighting spot */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-white/2 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
          100% { transform: translate(50px, -50px) scale(1.3); opacity: 0.65; }
        }
      `}</style>

      {/* Fullscreen Video Background if available */}
      {divinity.videoUrl && (
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden mix-blend-color-dodge">
          <video
            src={divinity.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Top Header Control bar */}
      <header className="relative z-10 flex justify-between items-center px-6 md:px-12 h-20 border-b border-white/5 bg-[#141313]/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest font-bold tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full text-white/90">
            {divinity.name} SESSION
          </span>
          <span className="hidden md:inline text-xs text-white/50">• Cinematic Space Active</span>
        </div>

        <button
          id="close-watch-button"
          onClick={onClose}
          className="w-11 h-11 rounded-full liquid-glass flex items-center justify-center cursor-pointer text-white/80 hover:text-white transition-all hover:scale-105"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <main className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-12 items-center justify-center px-6 md:px-12 py-6 gap-8 overflow-y-auto hide-scrollbar">
        
        {/* Left Side: Avatar & Breathing guide (col 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-6">
          {/* Spiritual apparition container with glow */}
          <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full flex items-center justify-center bg-white/2 border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.03)] overflow-hidden transition-transform duration-[4000ms] ease-in-out transform">
            <style>
              {`
                .inhale-glow { box-shadow: 0 0 60px rgba(255,255,255,0.07); transform: scale(1.03); }
                .hold-glow { box-shadow: 0 0 80px rgba(255,255,255,0.12); transform: scale(1.06); }
                .exhale-glow { box-shadow: 0 0 40px rgba(255,255,255,0.03); transform: scale(0.97); }
              `}
            </style>
            <div className={`absolute inset-1 rounded-full border border-white/5 transition-all duration-[4000ms] flex items-center justify-center ${
              breathPhase === "inhale" ? "inhale-glow" : breathPhase === "hold" ? "hold-glow" : "exhale-glow"
            }`}>
              {divinity.apparitionUrl ? (
                <img
                  src={divinity.apparitionUrl}
                  alt={divinity.name}
                  className="w-full h-full object-contain rounded-full opacity-65 mix-blend-lighten scale-90 transition-opacity duration-1000"
                  style={{
                    maskImage: "radial-gradient(circle, black 40%, transparent 80%)",
                    WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 80%)"
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-white/20 text-xs">Formless Absolute</div>
              )}
            </div>
          </div>

          {/* Prompt labels */}
          <div className="h-16 flex flex-col justify-center items-center">
            <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-mono mb-1">Guided Breath Cycle</span>
            <span className={`text-sm tracking-widest font-black transition-all duration-1000 uppercase font-mono ${getBreathLabel().style}`}>
              {getBreathLabel().text}
            </span>
          </div>

          {/* Mantra Chanting Slider */}
          <div className="max-w-md w-full bg-white/2 border border-white/5 p-4 rounded-2xl select-text">
            <span className="text-[9px] tracking-widest text-[#FFB800] uppercase font-mono block mb-1">Active Mantra Focus</span>
            <p className="text-sm font-bold text-white tracking-wide pr-2">
              {divinity.mantras[selectedMantraIdx]?.text}
            </p>
            <p className="text-xs text-white/50 italic leading-relaxed mt-1">
              "{divinity.mantras[selectedMantraIdx]?.translation}"
            </p>
            
            {divinity.mantras.length > 1 && (
              <div className="flex gap-1.5 justify-center mt-3 select-none">
                {divinity.mantras.map((_, mIdx) => (
                  <button
                    key={mIdx}
                    onClick={() => setSelectedMantraIdx(mIdx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      selectedMantraIdx === mIdx ? "w-4 bg-white" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Meditation Timer & Solfeggio Synth (col 7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6 w-full max-w-lg mx-auto">
          
          {/* TIMER COMPONENT */}
          <div className="w-full liquid-glass p-6 md:p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden">
            
            {isTimerCompleted ? (
              <div id="countdown-completed" className="py-8 space-y-4 animate-blur-fade-up">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mx-auto border border-white/20 shadow-md">
                  <Award className="h-8 w-8 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-white tracking-wider">MEDITATION RESTORED</h3>
                <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
                  You resolved {selectedDuration} minutes of focused silence with {divinity.name}. Your session has been safely logged in your spiritual records!
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleSetDuration(selectedDuration)}
                    className="px-5 py-2.5 rounded-xl bg-white text-[#141313] hover:bg-white/90 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Calibrate Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs shadow-md transition-all hover:bg-white/20 cursor-pointer"
                  >
                    Return to Lobby
                  </button>
                </div>
              </div>
            ) : (
              <div id="countdown-active" className="space-y-4">
                <span className="text-[10px] tracking-widest text-[#9ca3af]/60 font-mono uppercase block">Contemplation Countdown</span>
                
                {/* Timer display digits */}
                <div className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter select-none">
                  {formatTime(secondsRemaining)}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-1000"
                    style={{ width: `${(secondsRemaining / (selectedDuration * 60)) * 100}%` }}
                  />
                </div>

                {/* Timer Presets selection */}
                {!isTimerRunning && secondsRemaining === (selectedDuration * 60) && (
                  <div className="flex justify-center gap-2 py-1 select-none">
                    {[1, 5, 10, 20].map((d) => (
                      <button
                        key={d}
                        onClick={() => handleSetDuration(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-tight transition-all cursor-pointer ${
                          selectedDuration === d 
                            ? "bg-white text-[#141313] scale-105" 
                            : "bg-white/3 text-[#c4c7c8]/80 hover:text-white"
                        }`}
                      >
                        {d} MIN
                      </button>
                    ))}
                  </div>
                )}

                {/* Timer Actions row */}
                <div className="flex justify-center items-center gap-3 pt-2 select-none">
                  {/* Reset action button */}
                  {(secondsRemaining < selectedDuration * 60) && (
                    <button
                      onClick={() => handleSetDuration(selectedDuration)}
                      className="w-12 h-12 rounded-full border border-white/5 bg-white/3 hover:bg-white/8 hover:text-white flex items-center justify-center text-white/60 transition-all cursor-pointer"
                      title="Reset timer"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}

                  {/* Play/Pause primary button */}
                  <button
                    id="play-timer-button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-8 h-12 bg-white text-[#141313] hover:bg-white/90 text-xs font-mono font-bold uppercase rounded-full shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-4 w-4 fill-current" /> PAUSE DURATION
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" /> INITIATE SILENCE
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SOLEGGIO SYNTH CONTROLS PANEL */}
          <div className="w-full bg-[#141313]/55 backdrop-blur-xl p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center select-none">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-widest text-white/40 uppercase font-mono">Ambient Audio Tuning</span>
                <span className="text-xs font-black text-white">{divinity.sound.label} ({pitchFreq} Hz)</span>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  isPlayingSound 
                    ? "bg-white text-[#141313] hover:scale-105" 
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
                title={isPlayingSound ? "Mute soundtrack" : "Activate soundtrack"}
              >
                {isPlayingSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>

            {/* Slider Pitch Selection */}
            {isPlayingSound && (
              <div className="space-y-3.5 animate-blur-fade-up">
                {/* Volume slider control */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/40 font-mono uppercase">
                    <span>Volume comfort</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-white h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Synth Pitch Freq modulation slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/40 font-mono uppercase">
                    <span>Frequency tuner</span>
                    <span>{pitchFreq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min={(divinity.sound.frequency - 50).toString()}
                    max={(divinity.sound.frequency + 50).toString()}
                    step="0.5"
                    value={pitchFreq}
                    onChange={(e) => handleFrequenceChange(parseFloat(e.target.value))}
                    className="w-full accent-white h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 font-mono uppercase">
                    <span>-{divinity.sound.frequency - 50}Hz</span>
                    <span>+{divinity.sound.frequency + 50}Hz</span>
                  </div>
                </div>

                {/* Wave selector row */}
                <div className="space-y-1.5 select-none">
                  <span className="text-[10px] text-white/40 font-mono uppercase">Wave Generation Source</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "sine", label: "Sine (Pure Drone)" },
                      { id: "triangle", label: "Triangle (Warm Flute)" },
                      { id: "sawtooth", label: "Lowpass Saw (Harp Tone)" },
                    ].map((wave) => (
                      <button
                        key={wave.id}
                        onClick={() => handleWaveChange(wave.id as OscillatorType)}
                        className={`py-2 rounded-xl text-[10px] font-bold font-mono tracking-tight transition-all cursor-pointer ${
                          waveType === wave.id 
                            ? "bg-white/10 text-white border-white/20" 
                            : "bg-white/2 text-[#c4c7c8]/60 border border-transparent hover:text-white"
                        }`}
                      >
                        {wave.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 px-6 md:px-12 h-16 border-t border-white/5 bg-[#141313]/10 backdrop-blur-md flex justify-between items-center">
        <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
          © {new Date().getFullYear()} BUS PRESENTS MEDITATIONAL SUITE
        </span>
        <button 
          onClick={onClose}
          className="text-[10px] text-white/60 hover:text-white uppercase font-sans font-bold flex items-center gap-1 cursor-pointer"
        >
          Close & Return <Eye className="h-3 w-3" />
        </button>
      </footer>
    </div>
  );
}
