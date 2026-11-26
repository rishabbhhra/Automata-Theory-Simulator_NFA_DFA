import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Table2, ListChecks, Sparkles, BookOpen,
  Play, CheckCircle2, XCircle, ArrowRight,
} from 'lucide-react';
import { batchTestAutomata } from '../utils/automataEngine';
import { AUTOMATA_PRESETS } from '../utils/presets';

const TABS = [
  { id: 'table', label: 'Transition Table', icon: Table2 },
  { id: 'batch', label: 'Batch Test', icon: ListChecks },
  { id: 'regex', label: 'Regex → NFA', icon: Sparkles },
  { id: 'presets', label: 'Presets', icon: BookOpen },
];

const REGEX_EXAMPLES = ['(a|b)*abb', '0(0|1)*1', 'a+b*', '(0|1)?01'];

function TransitionTableTab({ states, transitions, mode, alphabet }) {
  const symbols = useMemo(() => {
    const set = new Set(alphabet);
    transitions.forEach(t => {
      if (t.label) set.add(t.label);
    });
    const list = [...set].filter(s => s !== 'ε').sort();
    if (mode === 'NFA' && set.has('ε')) list.push('ε');
    return list;
  }, [alphabet, transitions, mode]);

  if (states.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 font-mono">
        No states on the canvas yet. Add states or load a preset to view the transition table.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Formal <span className="font-mono text-sky-400">δ(q, σ)</span> transition function ({mode} mode)
        </span>
        <span className="font-mono text-[11px]">
          → Start · * Accept
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-4 py-2.5 text-slate-400 font-semibold">State</th>
              {symbols.length === 0 ? (
                <th className="px-4 py-2.5 text-slate-500 italic font-normal">No symbols</th>
              ) : (
                symbols.map(sym => (
                  <th key={sym} className="px-4 py-2.5 text-sky-400 font-bold text-center">
                    {sym}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {states.map((s, idx) => (
              <tr
                key={s.id}
                className="border-b border-slate-800/50 last:border-none hover:bg-slate-900/40"
                style={{ background: idx % 2 === 0 ? 'rgba(15,23,42,0.35)' : 'transparent' }}
              >
                <td className="px-4 py-2.5 font-bold whitespace-nowrap">
                  <span className="text-sky-400 mr-1">{s.isStart ? '→' : ''}</span>
                  <span className="text-emerald-400 mr-1">{s.isAccept ? '*' : ''}</span>
                  <span className="text-slate-100">{s.label || s.id}</span>
                </td>
                {symbols.length === 0 ? (
                  <td className="px-4 py-2.5 text-slate-600">—</td>
                ) : (
                  symbols.map(sym => {
                    const targets = transitions
                      .filter(t => t.from === s.id && t.label === sym)
                      .map(t => {
                        const targetState = states.find(st => st.id === t.to);
                        return targetState?.label || t.to;
                      });
                    return (
                      <td key={sym} className="px-4 py-2.5 text-center">
                        {targets.length === 0 ? (
                          <span className="text-slate-600">∅</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-sky-300">
                            {mode === 'NFA' ? `{${targets.join(', ')}}` : targets[0]}
                          </span>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatchTestTab({ states, transitions, mode, alphabet }) {
  const [rawText, setRawText] = useState('ε\n0\n1\n01\n10\n101\n110');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleRunBatch = () => {
    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter((l, i, arr) => l.length > 0 || arr.length === 1);

    const res = batchTestAutomata(lines, states, transitions, mode, alphabet);
    if (res.error) {
      setError(res.error);
      setResults(null);
    } else {
      setError(null);
      setResults(res.results);
    }
  };

  const acceptedCount = results ? results.filter(r => r.accepted).length : 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-400">
        Enter one test string per line (use <code className="text-amber-400 font-mono">ε</code> for empty string) to evaluate all strings at once.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={8}
            placeholder="010&#10;101&#10;ε"
            className="w-full rounded-xl p-3 font-mono text-xs resize-none sim-input"
          />
          <button
            onClick={handleRunBatch}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1px solid #38bdf8',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
            }}
          >
            <Play size={13} />
            Run Batch Simulation
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col max-h-[245px] overflow-y-auto">
          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {!error && !results && (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">
              Click "Run Batch Simulation" to see results
            </div>
          )}

          {results && (
            <>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 mb-2 border-b border-slate-800">
                <span>Results ({results.length} strings)</span>
                <span className="text-emerald-400 font-bold">
                  {acceptedCount} accepted · {results.length - acceptedCount} rejected
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono"
                    style={{
                      background: r.accepted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                      border: `1px solid ${r.accepted ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                    }}
                  >
                    <span className="text-slate-200 font-bold truncate max-w-[120px]">{r.input}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400">{r.stepCount} steps</span>
                      {r.accepted ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 size={12} /> ACC
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                          <XCircle size={12} /> REJ
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RegexTab({ onGenerateRegex, onClose }) {
  const [regex, setRegex] = useState('(a|b)*abb');

  const handleBuild = () => {
    const ok = onGenerateRegex(regex);
    if (ok) onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400 leading-relaxed">
        Generate an <span className="text-sky-400 font-semibold">ε-NFA</span> automatically using{' '}
        <span className="text-slate-200 font-semibold">Thompson&apos;s Construction</span>. Supports concatenation,{' '}
        <code className="font-mono text-sky-400">|</code> (union),{' '}
        <code className="font-mono text-sky-400">*</code> (Kleene star),{' '}
        <code className="font-mono text-sky-400">+</code> (one or more),{' '}
        <code className="font-mono text-sky-400">?</code> (optional), and parentheses.
      </p>

      <div className="flex gap-2">
        <input
          value={regex}
          onChange={e => setRegex(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBuild()}
          placeholder="e.g. (a|b)*abb"
          className="flex-1 px-3.5 py-2.5 rounded-xl font-mono text-sm sim-input"
        />
        <button
          onClick={handleBuild}
          disabled={!regex.trim()}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: '1px solid #38bdf8',
          }}
        >
          <Sparkles size={14} />
          Build NFA
        </button>
      </div>

      <div>
        <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Quick Examples
        </span>
        <div className="flex flex-wrap gap-2">
          {REGEX_EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setRegex(ex)}
              className="px-3 py-1.5 rounded-lg font-mono text-xs text-sky-300 bg-sky-500/10 border border-sky-500/25 hover:border-sky-400 hover:bg-sky-500/20 transition-all"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetsTab({ onLoadPreset, onClose }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
      {AUTOMATA_PRESETS.map(p => (
        <button
          key={p.id}
          onClick={() => { onLoadPreset(p); onClose(); }}
          className="text-left p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-sky-500/50 hover:bg-slate-800/60 transition-all group flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              {p.name}
            </span>
            <span
              className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
              style={{
                background: p.mode === 'DFA' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                color: p.mode === 'DFA' ? '#38bdf8' : '#c4b5fd',
                border: `1px solid ${p.mode === 'DFA' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
              }}
            >
              {p.mode}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>{p.states.length} states · Σ={`{${p.alphabet.join(',')}}`}</span>
            <span className="flex items-center gap-1 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Load <ArrowRight size={10} />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function WorkbenchModal({
  isOpen,
  initialTab = 'table',
  onClose,
  states,
  transitions,
  mode,
  alphabet,
  onLoadPreset,
  onGenerateRegex,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab when opened from a specific button
  useMemo(() => {
    if (isOpen && initialTab) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{ background: 'rgba(6, 9, 17, 0.78)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="w-full max-w-2xl pointer-events-auto rounded-2xl overflow-hidden glass-panel flex flex-col max-h-[85vh]"
              style={{
                background: 'rgba(13, 21, 39, 0.96)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 35px rgba(56, 189, 248, 0.1)',
              }}
            >
              {/* Header + Tabs */}
              <div
                className="flex items-center justify-between px-4 pt-3 pb-0 border-b gap-2 flex-wrap"
                style={{ borderColor: 'rgba(39, 62, 107, 0.6)' }}
              >
                <div className="flex items-center gap-1 overflow-x-auto">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap"
                        style={{
                          borderColor: isActive ? '#38bdf8' : 'transparent',
                          color: isActive ? '#38bdf8' : '#94a3b8',
                        }}
                      >
                        <Icon size={13} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={onClose}
                  className="w-7 h-7 mb-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto">
                {activeTab === 'table' && (
                  <TransitionTableTab
                    states={states}
                    transitions={transitions}
                    mode={mode}
                    alphabet={alphabet}
                  />
                )}
                {activeTab === 'batch' && (
                  <BatchTestTab
                    states={states}
                    transitions={transitions}
                    mode={mode}
                    alphabet={alphabet}
                  />
                )}
                {activeTab === 'regex' && (
                  <RegexTab
                    onGenerateRegex={onGenerateRegex}
                    onClose={onClose}
                  />
                )}
                {activeTab === 'presets' && (
                  <PresetsTab
                    onLoadPreset={onLoadPreset}
                    onClose={onClose}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
