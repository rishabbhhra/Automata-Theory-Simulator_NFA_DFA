import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw,
  Cpu, Zap, AlertCircle, CheckCircle2, XCircle,
  Menu, ChevronDown, Repeat, SkipBack,
  SlidersHorizontal,
} from 'lucide-react';

const SPEEDS = [
  { label: '0.5×', value: 1600 },
  { label: '1×',   value: 800  },
  { label: '2×',   value: 400  },
  { label: '3×',   value: 200  },
];

function ModeToggle({ mode, onModeChange }) {
  return (
    <div
      className="flex p-0.5 rounded-xl overflow-hidden shrink-0"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(39, 62, 107, 0.6)',
      }}
    >
      {['DFA', 'NFA'].map(m => {
        const isSelected = mode === m;
        return (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className="relative px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: isSelected ? '#ffffff' : '#94a3b8',
              zIndex: 1,
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="modeIndicator"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{m}</span>
          </button>
        );
      })}
    </div>
  );
}

function SimButton({ onClick, disabled, title, icon: Icon, variant = 'default', active }) {
  const configs = {
    default: {
      bg: 'rgba(21, 34, 58, 0.7)',
      border: 'rgba(39, 62, 107, 0.6)',
      color: '#cbd5e1',
      hoverBg: 'rgba(30, 48, 84, 0.9)',
      hoverColor: '#ffffff',
    },
    primary: {
      bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      border: '#38bdf8',
      color: '#ffffff',
      glow: '0 0 20px rgba(56, 189, 248, 0.45)',
    },
    danger: {
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.5)',
      color: '#f43f5e',
      glow: '0 0 15px rgba(244, 63, 94, 0.3)',
    },
  };

  const c = configs[variant] || configs.default;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all relative"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? c.glow || `0 0 12px ${c.border}` : 'none',
      }}
    >
      <Icon size={14} />
    </motion.button>
  );
}

function SimRunModeToggle({ mode, onModeChange, disabled }) {
  const modes = [
    { label: 'Continuous', value: 'continuous', icon: Repeat },
    { label: 'Discrete', value: 'discrete', icon: SkipBack },
  ];

  return (
    <div
      className="flex p-0.5 rounded-lg overflow-hidden shrink-0"
      style={{
        border: '1px solid rgba(39, 62, 107, 0.6)',
        background: 'rgba(15, 23, 42, 0.7)',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {modes.map(m => {
        const isSelected = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            disabled={disabled}
            className="px-2.5 py-1 text-[11px] font-semibold transition-all rounded"
            style={{
              color: isSelected ? '#38bdf8' : '#94a3b8',
              background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function SimRunModeDropdown({ mode, onModeChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = 140;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      setPos({ top: rect.bottom + 4, left });
    }
    setOpen(o => !o);
  };

  const modes = [
    { label: 'Continuous', value: 'continuous', icon: Repeat },
    { label: 'Discrete', value: 'discrete', icon: SkipBack },
  ];
  const current = modes.find(m => m.value === mode) || modes[0];

  return (
    <div ref={ref}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(39, 62, 107, 0.6)',
          color: '#38bdf8',
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <current.icon size={11} />
        <span>{current.label.slice(0, 4)}.</span>
        <ChevronDown
          size={10}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed rounded-xl overflow-hidden z-[9999]"
            style={{
              top: pos.top,
              left: pos.left,
              background: '#0d1527',
              border: '1px solid rgba(39, 62, 107, 0.8)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
              minWidth: 140,
            }}
          >
            {modes.map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.value}
                  onClick={() => { onModeChange(m.value); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    color: mode === m.value ? '#38bdf8' : '#cbd5e1',
                    background: mode === m.value ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    borderBottom: '1px solid rgba(30, 48, 84, 0.5)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <Icon size={12} />
                  {m.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="w-px h-5 mx-1 shrink-0 hidden md:block"
      style={{ background: 'rgba(39, 62, 107, 0.5)' }}
    />
  );
}

export default function Navbar({
  mode, onModeChange,
  inputString, onInputChange,
  simStatus,
  onPlay, onPause, onStep, onStepBack, onReset, onStop,
  simResult,
  hasStartState,
  simSpeed, onSpeedChange,
  isAtFirstStep,
  isAtLastStep,
  simRunMode, onSimRunModeChange,
  onToggleSidebar,
}) {
  const isRunning = simStatus === 'running';
  const isIdle = simStatus === 'idle';
  const isDone = simStatus === 'done';

  return (
    <header
      className="navbar-header flex items-center justify-between gap-2 md:gap-3 px-3 md:px-5 h-14 shrink-0 glass-panel border-b border-surface-700/80 z-20"
      style={{
        background: 'rgba(10, 15, 29, 0.92)',
        borderBottom: '1px solid rgba(39, 62, 107, 0.65)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left section: mobile toggle + logo + mode */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors"
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(21, 34, 58, 0.7)',
            border: '1px solid rgba(39, 62, 107, 0.6)',
            color: '#cbd5e1',
          }}
          title="Toggle sidebar"
        >
          <Menu size={15} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.2)',
            }}
          >
            <Cpu size={14} style={{ color: '#38bdf8' }} />
          </div>
          <div className="flex flex-col">
            <span
              className="text-xs font-extrabold tracking-tight hidden sm:inline leading-none"
              style={{ color: '#f8fafc', letterSpacing: '-0.01em' }}
            >
              AUTOMATA<span style={{ color: '#38bdf8' }}>.</span>SIM
            </span>
            <span
              className="text-[9px] font-semibold text-slate-400 tracking-wider hidden sm:inline leading-none uppercase mt-0.5"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Theory Engine
            </span>
          </div>
        </div>

        <Divider />

        {/* Mode toggle */}
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>

      {/* Middle section: input box */}
      <div className="flex items-center gap-2 flex-1 min-w-[130px] max-w-xs md:max-w-sm mx-1">
        <div className="relative w-full">
          <input
            value={inputString}
            onChange={e => onInputChange(e.target.value)}
            placeholder={mode === 'NFA' ? "Input tape (e.g. 0101 or ε)" : "Input tape (e.g. 0101)"}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-mono sim-input"
            onKeyDown={e => { if (e.key === 'Enter' && hasStartState) onPlay(); }}
          />
          {inputString.length > 0 && (
            <span
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 pointer-events-none hidden sm:inline"
            >
              |w|={inputString.length}
            </span>
          )}
        </div>
      </div>

      {/* Right section: simulation controls, speed, mode & result */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        {/* Play / Pause / Stop / Step / Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isRunning ? (
            <SimButton onClick={onPause} icon={Pause} variant="primary" title="Pause (Space)" active />
          ) : (
            <SimButton
              onClick={onPlay}
              icon={Play}
              variant="primary"
              disabled={!hasStartState || (simRunMode === 'discrete' && !isIdle)}
              title={!hasStartState ? 'Set a start state first' : 'Play (Enter or Space)'}
            />
          )}

          {(simStatus === 'running' || simStatus === 'paused') && (
            <SimButton onClick={onStop} icon={XCircle} variant="danger" title="Stop" />
          )}

          <SimButton
            onClick={onStepBack}
            icon={SkipBack}
            disabled={!hasStartState || isIdle || isAtFirstStep}
            title="Step backward"
          />

          <SimButton
            onClick={onStep}
            icon={SkipForward}
            disabled={!hasStartState || isIdle || isDone || isAtLastStep}
            title="Step forward"
          />

          <SimButton
            onClick={onReset}
            icon={RotateCcw}
            disabled={isIdle}
            title="Reset simulation"
          />
        </div>

        <Divider />

        {/* Speed */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <Zap size={11} style={{ color: '#94a3b8' }} />
          <div
            className="flex p-0.5 rounded-lg overflow-hidden"
            style={{
              border: '1px solid rgba(39, 62, 107, 0.6)',
              background: 'rgba(15, 23, 42, 0.7)',
            }}
          >
            {SPEEDS.map(s => {
              const isSelected = simSpeed === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => onSpeedChange(s.value)}
                  className="px-2 py-0.5 text-[10px] font-bold font-mono transition-all rounded"
                  style={{
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Run Mode */}
        <div className="sm:hidden flex items-center shrink-0">
          <SimRunModeDropdown
            mode={simRunMode}
            onModeChange={onSimRunModeChange}
            disabled={!isIdle}
          />
        </div>
        <div className="hidden sm:flex items-center shrink-0">
          <SimRunModeToggle
            mode={simRunMode}
            onModeChange={onSimRunModeChange}
            disabled={!isIdle}
          />
        </div>

        <Divider />

        {/* Result Badge */}
        <div className="shrink-0 min-w-[32px] flex justify-end">
          {simResult === 'accepted' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={13} />
              <span className="hidden sm:inline font-mono tracking-wide">ACCEPTED</span>
              <span className="sm:hidden">✓</span>
            </motion.div>
          )}

          {simResult === 'rejected' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid #f43f5e',
                color: '#f43f5e',
                boxShadow: '0 0 16px rgba(244, 63, 94, 0.3)',
              }}
            >
              <XCircle size={13} />
              <span className="hidden sm:inline font-mono tracking-wide">REJECTED</span>
              <span className="sm:hidden">✗</span>
            </motion.div>
          )}

          {!simResult && !hasStartState && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <AlertCircle size={12} />
              <span className="hidden sm:inline font-medium">No start state</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
