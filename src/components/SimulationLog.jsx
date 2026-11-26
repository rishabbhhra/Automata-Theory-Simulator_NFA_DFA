import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, Circle, Activity,
} from 'lucide-react';

function StepRow({ step, isCurrent, isCompleted }) {
  const isDeadStep = step.dead;

  let bg = 'transparent';
  let borderColor = 'rgba(39, 62, 107, 0.4)';
  let rowOpacity = 1;

  if (isCurrent && !isDeadStep) {
    bg = 'rgba(56, 189, 248, 0.08)';
    borderColor = '#38bdf8';
  } else if (isCurrent && isDeadStep) {
    bg = 'rgba(244, 63, 94, 0.1)';
    borderColor = '#f43f5e';
  } else if (isCompleted) {
    rowOpacity = 0.85;
  }

  const descColor = isCurrent
    ? (isDeadStep ? '#fca5a5' : '#7dd3fc')
    : '#94a3b8';

  const consumedColor = '#64748b';
  const nextCharColor = isDeadStep ? '#f43f5e' : '#38bdf8';
  const remainingColor = '#94a3b8';

  const badgeBg = isCurrent
    ? (isDeadStep ? 'rgba(244, 63, 94, 0.18)' : 'rgba(56, 189, 248, 0.16)')
    : 'rgba(30, 48, 84, 0.5)';
  const badgeBorder = isCurrent
    ? (isDeadStep ? '#f43f5e' : '#38bdf8')
    : 'rgba(51, 65, 85, 0.7)';
  const badgeText = isCurrent
    ? (isDeadStep ? '#fca5a5' : '#38bdf8')
    : '#cbd5e1';

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: rowOpacity, x: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs transition-all"
      style={{
        background: bg,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* Step Index Badge */}
      <span
        className="font-mono shrink-0 w-6 text-right tabular-nums text-[11px] font-bold"
        style={{
          color: isCurrent ? '#f59e0b' : '#64748b',
        }}
      >
        #{step.stepIndex}
      </span>

      {/* Input Tape Display */}
      {step.consumed !== undefined && (
        <div
          className="font-mono shrink-0 text-xs tracking-wider px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800"
        >
          <span style={{ color: consumedColor }}>{step.consumed}</span>
          {isCurrent && step.remaining?.length > 0 && (
            <>
              <span
                style={{
                  color: nextCharColor,
                  fontWeight: 800,
                  borderBottom: `2px solid ${nextCharColor}`,
                  paddingBottom: 1,
                }}
              >
                {step.remaining[0]}
              </span>
              <span style={{ color: remainingColor }}>{step.remaining.slice(1)}</span>
            </>
          )}
          {isCurrent && step.remaining?.length === 0 && (
            <span className="text-emerald-400 font-bold ml-1">ε</span>
          )}
        </div>
      )}

      {/* Divider */}
      <div
        className="w-px h-4 shrink-0 hidden sm:block bg-slate-800"
      />

      {/* Active State Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(step.activeStates ?? []).map(s => (
          <span
            key={s}
            className="font-mono px-2 py-0.5 rounded text-[11px] font-bold"
            style={{
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              color: badgeText,
            }}
          >
            {s}
          </span>
        ))}
        {step.dead && (
          <span className="text-xs text-rose-400 font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
            TRAP ∅
          </span>
        )}
      </div>

      {/* Description */}
      <span
        className="ml-auto shrink-0 max-w-[140px] sm:max-w-xs text-right truncate text-[11px] font-medium"
        style={{ color: descColor }}
        title={step.description}
      >
        {step.description}
      </span>
    </motion.div>
  );
}

export default function SimulationLog({
  simData, currentStep, simResult, simStatus, inputString,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep, collapsed]);

  const hasData = simData && simData.steps.length > 0;
  const isRunning = simStatus === 'running';
  const isIdle = simStatus === 'idle';

  return (
    <motion.div
      animate={{ height: collapsed ? 44 : 'clamp(160px, 32vh, 290px)' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="simlog-container shrink-0 overflow-hidden glass-panel"
      style={{
        background: 'rgba(8, 12, 23, 0.96)',
        borderTop: '1px solid rgba(39, 62, 107, 0.65)',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header Bar */}
      <div
        className="flex items-center gap-2.5 px-4 h-11 shrink-0 cursor-pointer select-none border-b transition-colors"
        onClick={() => setCollapsed(c => !c)}
        style={{
          borderColor: collapsed ? 'transparent' : 'rgba(39, 62, 107, 0.5)',
          background: 'rgba(13, 20, 37, 0.85)',
        }}
      >
        <div className="w-5 h-5 rounded flex items-center justify-center bg-sky-500/10 text-sky-400">
          <Terminal size={12} />
        </div>

        <span
          className="text-xs font-bold tracking-wider uppercase text-slate-200"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <span className="hidden sm:inline">Execution Trace</span>
          <span className="sm:hidden">Trace</span>
        </span>

        {hasData && (
          <span
            className="font-mono text-xs text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded"
          >
            Step {currentStep >= 0 ? currentStep : 0} of {simData.steps.length - 1}
          </span>
        )}

        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={12} />
            </motion.div>
            <span className="text-[11px] hidden sm:inline">Simulating...</span>
          </div>
        )}

        {/* Result Badges */}
        {simResult === 'accepted' && (
          <div
            className="flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30"
          >
            <CheckCircle2 size={12} />
            <span>ACCEPTED</span>
          </div>
        )}
        {simResult === 'rejected' && (
          <div
            className="flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30"
          >
            <XCircle size={12} />
            <span>REJECTED</span>
          </div>
        )}

        <button
          className="ml-auto text-slate-400 hover:text-slate-200 transition-colors"
          onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Log Body */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-y-auto simlog-scroll p-1"
          >
            {isIdle && !hasData && (
              <div className="flex items-center gap-2 px-4 py-4 text-xs text-slate-400 font-mono">
                <Circle size={8} className="text-sky-400/60 fill-sky-400/30 animate-pulse" />
                <span>Engine standby — enter an input tape and click Play to begin simulation</span>
              </div>
            )}

            {hasData && simData.steps.map((step, i) => (
              <StepRow
                key={i}
                step={step}
                isCurrent={i === currentStep}
                isCompleted={i < currentStep}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
