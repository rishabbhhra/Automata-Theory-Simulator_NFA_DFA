import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, GitBranch, Trash2, MousePointer2,
  ChevronRight, X, Layers, Hash, ArrowRightLeft,
  Sparkles, Table2, ListChecks, BookOpen, Minimize2, Shuffle,
  Download, Upload,
} from 'lucide-react';

function SidebarButton({ onClick, icon: Icon, label, active, variant = 'default', disabled }) {
  const themes = {
    default: {
      idleBg: 'rgba(15, 23, 42, 0.6)',
      activeBg: 'rgba(56, 189, 248, 0.15)',
      idleBorder: 'rgba(39, 62, 107, 0.5)',
      activeBorder: '#38bdf8',
      idleColor: '#cbd5e1',
      activeColor: '#38bdf8',
      glow: '0 0 16px rgba(56, 189, 248, 0.25)',
    },
    purple: {
      idleBg: 'rgba(15, 23, 42, 0.6)',
      activeBg: 'rgba(139, 92, 246, 0.15)',
      idleBorder: 'rgba(39, 62, 107, 0.5)',
      activeBorder: '#a78bfa',
      idleColor: '#cbd5e1',
      activeColor: '#c4b5fd',
      glow: '0 0 16px rgba(139, 92, 246, 0.25)',
    },
    danger: {
      idleBg: 'rgba(15, 23, 42, 0.6)',
      activeBg: 'rgba(244, 63, 94, 0.15)',
      idleBorder: 'rgba(39, 62, 107, 0.5)',
      activeBorder: '#f43f5e',
      idleColor: '#cbd5e1',
      activeColor: '#fca5a5',
      glow: '0 0 16px rgba(244, 63, 94, 0.25)',
    },
  };

  const t = themes[variant] || themes.default;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.015, x: 2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl transition-all"
      style={{
        background: active ? t.activeBg : t.idleBg,
        border: `1px solid ${active ? t.activeBorder : t.idleBorder}`,
        color: active ? t.activeColor : t.idleColor,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? t.glow : 'none',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      <Icon size={14} style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }} />
      <span>{label}</span>
    </motion.button>
  );
}

function SectionLabel({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      {Icon && <Icon size={11} className="text-slate-400" />}
      <span
        className="text-[10px] font-bold tracking-wider uppercase text-slate-400"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-800/80" />
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-5">
      <SectionLabel title={title} icon={icon} />
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function AlphabetSection({ alphabet, onAdd, onRemove, disabled }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === 'ε') return;
    onAdd(trimmed);
    setInput('');
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Hash size={11} className="text-slate-400" />
          <span
            className="text-[10px] font-bold tracking-wider uppercase text-slate-400"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            Alphabet Σ
          </span>
        </div>
        {alphabet.length > 0 && (
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
            }}
          >
            |Σ| = {alphabet.length}
          </span>
        )}
      </div>

      {/* Symbol chips */}
      {alphabet.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <AnimatePresence>
            {alphabet.map(sym => (
              <motion.div
                key={sym}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <span
                  className="font-mono text-xs font-bold text-sky-400"
                >
                  {sym}
                </span>
                {!disabled && (
                  <button
                    onClick={() => onRemove(sym)}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input row */}
      {!disabled && (
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Symbol (e.g. 0, 1, a)"
            className="flex-1 rounded-xl px-3 py-1.5 font-mono text-xs min-w-0"
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: `1px solid ${focused ? '#38bdf8' : 'rgba(39, 62, 107, 0.6)'}`,
              color: '#f1f5f9',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.92 }}
            disabled={!input.trim() || input.trim() === 'ε'}
            className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 transition-all"
            style={{
              background: input.trim() ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${input.trim() ? '#38bdf8' : 'rgba(39, 62, 107, 0.5)'}`,
              color: input.trim() ? '#38bdf8' : '#475569',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={14} />
          </motion.button>
        </div>
      )}

      {alphabet.length === 0 && !disabled && (
        <p className="text-[10px] text-slate-400 px-1 mt-1.5 whitespace-normal leading-relaxed">
          Add alphabet symbols to configure transitions.
        </p>
      )}
    </div>
  );
}

function StateBadge({ label, color, bg, border }) {
  return (
    <span
      className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {label}
    </span>
  );
}

export default function Sidebar({
  states, transitions,
  canvasMode, onCanvasModeChange,
  onClear,
  onRemoveTransition,
  pendingTransition, onCancelTransition,
  simStatus,
  mode,
  alphabet, onAddAlphabetSymbol, onRemoveAlphabetSymbol,
  isOpen, onClose,
  onOpenWorkbench,
  onConvertNFAtoDFA,
  onMinimizeDFA,
  onExportJSON,
  onImportJSON,
}) {
  const isSimulating = simStatus !== 'idle';
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImportJSON(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sidebar-backdrop"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar-panel ${isOpen ? 'sidebar-open' : ''} glass-panel border-r border-surface-700/80 z-10`}
        style={{
          background: 'rgba(10, 15, 29, 0.95)',
          borderRight: '1px solid rgba(39, 62, 107, 0.65)',
        }}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 md:hidden">
          <span className="text-sm font-bold text-slate-200">
            Automata Panel
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Build Tools */}
          <Section title="Design" icon={Layers}>
            <SidebarButton
              onClick={() => onCanvasModeChange(canvasMode === 'addState' ? 'select' : 'addState')}
              icon={Plus}
              label="Add State"
              active={canvasMode === 'addState'}
              disabled={isSimulating}
            />
            <SidebarButton
              onClick={() => {
                if (canvasMode === 'addTransition') {
                  onCancelTransition();
                } else {
                  onCanvasModeChange('addTransition');
                }
              }}
              icon={GitBranch}
              label={pendingTransition ? 'Cancel Transition' : 'Add Transition'}
              active={canvasMode === 'addTransition'}
              variant="purple"
              disabled={isSimulating || states.length < 1 || (mode === 'DFA' && alphabet.length === 0)}
            />
            <SidebarButton
              onClick={() => onCanvasModeChange('select')}
              icon={MousePointer2}
              label="Select / Pan"
              active={canvasMode === 'select'}
            />
          </Section>

          {/* Alphabet — DFA only */}
          {mode === 'DFA' && (
            <AlphabetSection
              alphabet={alphabet}
              onAdd={onAddAlphabetSymbol}
              onRemove={onRemoveAlphabetSymbol}
              disabled={isSimulating}
            />
          )}

          {/* States list */}
          {states.length > 0 && (
            <Section title={`States (${states.length})`}>
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: '1px solid rgba(39, 62, 107, 0.6)',
                  background: 'rgba(15, 23, 42, 0.6)',
                }}
              >
                {states.map((s, i) => {
                  const nameColor = s.isStart
                    ? '#38bdf8'
                    : s.isAccept
                      ? '#10b981'
                      : '#cbd5e1';

                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-800/40"
                      style={{
                        borderBottom: i < states.length - 1 ? '1px solid rgba(30, 48, 84, 0.4)' : 'none',
                      }}
                    >
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: nameColor }}
                      >
                        {s.label}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {s.isStart && (
                          <StateBadge
                            label="START"
                            color="#38bdf8"
                            bg="rgba(56, 189, 248, 0.15)"
                            border="rgba(56, 189, 248, 0.35)"
                          />
                        )}
                        {s.isAccept && (
                          <StateBadge
                            label="ACC"
                            color="#10b981"
                            bg="rgba(16, 185, 129, 0.15)"
                            border="rgba(16, 185, 129, 0.35)"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 px-1 mt-1.5 whitespace-normal leading-relaxed">
                Hover state on canvas for actions · Double-click to rename
              </p>
            </Section>
          )}

          {/* Transitions list */}
          {transitions.length > 0 && (
            <Section title={`Transitions (${transitions.length})`} icon={ArrowRightLeft}>
              <div
                className="rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                style={{
                  border: '1px solid rgba(39, 62, 107, 0.6)',
                  background: 'rgba(15, 23, 42, 0.6)',
                }}
              >
                {transitions.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 px-3 py-2 group hover:bg-slate-800/40 transition-colors"
                    style={{
                      borderBottom: i < transitions.length - 1 ? '1px solid rgba(30, 48, 84, 0.4)' : 'none',
                    }}
                  >
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {t.from}
                    </span>
                    <ChevronRight size={10} className="text-slate-500 shrink-0" />
                    <span
                      className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        color: '#38bdf8',
                      }}
                    >
                      {t.label}
                    </span>
                    <ChevronRight size={10} className="text-slate-500 shrink-0" />
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {t.to}
                    </span>
                    <button
                      onClick={() => onRemoveTransition(t.id)}
                      disabled={isSimulating}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-400"
                      title="Remove transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Theory & Advanced Tools */}
          <Section title="Theory & Tools" icon={Sparkles}>
            {mode === 'NFA' ? (
              <SidebarButton
                onClick={onConvertNFAtoDFA}
                icon={Shuffle}
                label="Convert NFA → DFA"
                variant="purple"
                disabled={isSimulating || states.length === 0}
              />
            ) : (
              <SidebarButton
                onClick={onMinimizeDFA}
                icon={Minimize2}
                label="Minimize DFA"
                variant="purple"
                disabled={isSimulating || states.length < 2}
              />
            )}
            <SidebarButton
              onClick={() => onOpenWorkbench('regex')}
              icon={Sparkles}
              label="Regex → NFA"
              disabled={isSimulating}
            />
            <SidebarButton
              onClick={() => onOpenWorkbench('table')}
              icon={Table2}
              label="Transition Table"
            />
            <SidebarButton
              onClick={() => onOpenWorkbench('batch')}
              icon={ListChecks}
              label="Batch Test"
              disabled={states.length === 0}
            />
            <SidebarButton
              onClick={() => onOpenWorkbench('presets')}
              icon={BookOpen}
              label="Load Presets"
              disabled={isSimulating}
            />
          </Section>

          {/* Reset / Clear & Export/Import */}
          <Section title="Canvas & File">
            <div className="flex gap-1.5">
              <button
                onClick={onExportJSON}
                disabled={states.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-35"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(39, 62, 107, 0.5)',
                  color: '#cbd5e1',
                }}
                title="Export automaton as JSON"
              >
                <Download size={12} />
                Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSimulating}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-35"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(39, 62, 107, 0.5)',
                  color: '#cbd5e1',
                }}
                title="Import automaton from JSON"
              >
                <Upload size={12} />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <SidebarButton
              onClick={onClear}
              icon={Trash2}
              label="Clear All Canvas"
              variant="danger"
              disabled={isSimulating || (states.length === 0 && transitions.length === 0)}
            />
          </Section>
        </div>

        {/* Footer Statistics */}
        <div
          className="px-4 py-3 flex items-center justify-between shrink-0 text-[11px] text-slate-400 border-t"
          style={{
            borderColor: 'rgba(39, 62, 107, 0.65)',
            background: 'rgba(10, 15, 29, 0.98)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span className="text-slate-300 font-semibold">{states.length} states</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-semibold">{transitions.length} trans</span>
          <span className="text-slate-600">·</span>
          <span className="text-sky-400 font-semibold">{alphabet.length} symbols</span>
        </div>
      </aside>
    </>
  );
}
