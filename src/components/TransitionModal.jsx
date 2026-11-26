import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, ArrowRight } from 'lucide-react';

export default function TransitionModal({ isOpen, data, mode, alphabet, onSubmit, onClose }) {
  const [label, setLabel] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setLabel('');
  }, [label, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  }, [handleSubmit, onClose]);

  if (!isOpen || !data) return null;

  const isDFA = mode === 'DFA';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{
              background: 'rgba(6, 9, 17, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="w-full max-w-sm pointer-events-auto rounded-2xl overflow-hidden glass-panel"
              style={{
                background: 'rgba(13, 21, 39, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.1)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'rgba(39, 62, 107, 0.6)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                    <GitBranch size={13} className="text-sky-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-100">
                    Add Transition
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5 flex flex-col gap-4">
                {/* States Flow Visualizer */}
                <div
                  className="flex items-center justify-center gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(39, 62, 107, 0.5)',
                  }}
                >
                  <span
                    className="font-mono font-bold px-3 py-1 rounded-lg text-xs"
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                    }}
                  >
                    {data.from}
                  </span>
                  <ArrowRight size={14} className="text-slate-500" />
                  <span
                    className="font-mono font-bold px-3 py-1 rounded-lg text-xs"
                    style={{
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      color: '#c4b5fd',
                    }}
                  >
                    {data.to}
                  </span>
                </div>

                {/* Symbol Selector / Input */}
                <div>
                  <label
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono"
                  >
                    Transition Symbol
                  </label>

                  {isDFA && alphabet && alphabet.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {alphabet.map(sym => (
                        <button
                          key={sym}
                          onClick={() => onSubmit(sym)}
                          className="font-mono font-bold px-4 py-2 rounded-xl transition-all"
                          style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38bdf8',
                            fontSize: 13,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)';
                            e.currentTarget.style.borderColor = '#38bdf8';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.3)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={label}
                        onChange={e => setLabel(e.target.value.slice(0, 8))}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. 0, 1, a, ε"
                        className="flex-1 rounded-xl px-3.5 py-2 font-mono text-sm min-w-0"
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(39, 62, 107, 0.7)',
                          color: '#f8fafc',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => onSubmit('ε')}
                        className="font-mono font-bold px-3.5 py-2 rounded-xl transition-all"
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#f59e0b',
                          fontSize: 14,
                        }}
                        title="Epsilon (empty) transition"
                      >
                        ε
                      </button>
                    </div>
                  )}
                </div>

                {!isDFA && (
                  <button
                    onClick={handleSubmit}
                    disabled={!label.trim()}
                    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all mt-1"
                    style={{
                      background: label.trim()
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : 'rgba(21, 34, 58, 0.5)',
                      border: `1px solid ${label.trim() ? '#38bdf8' : 'rgba(39, 62, 107, 0.6)'}`,
                      color: label.trim() ? '#ffffff' : '#64748b',
                      cursor: label.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: label.trim() ? '0 0 20px rgba(56, 189, 248, 0.35)' : 'none',
                    }}
                  >
                    Add Transition
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
