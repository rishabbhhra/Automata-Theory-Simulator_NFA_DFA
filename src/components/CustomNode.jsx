import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomNode = memo(({ id, data }) => {
  const {
    label, isStart, isAccept, isActive, isDead,
    canvasMode, pendingFrom,
    onNodeClick, onRemove, onSetStart, onToggleAccept, onRename,
  } = data;

  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const inputRef = useRef(null);
  const isSourcePending = pendingFrom === id;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (canvasMode === 'addTransition') {
      onNodeClick(id);
    }
  }, [canvasMode, id, onNodeClick]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (canvasMode !== 'addTransition') {
      setEditing(true);
      setEditLabel(label);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [label, canvasMode]);

  const commitRename = useCallback(() => {
    if (editLabel.trim() && editLabel.trim() !== label) {
      onRename(id, editLabel.trim());
    }
    setEditing(false);
  }, [editLabel, label, id, onRename]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditing(false); setEditLabel(label); }
  }, [commitRename, label]);

  // Color theme logic
  let borderColor = 'rgba(71, 85, 105, 0.7)';
  let textColor = '#e2e8f0';
  let shadowStyle = {
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  };

  if (isActive) {
    borderColor = '#38bdf8';
    textColor = '#38bdf8';
    shadowStyle = {
      boxShadow: '0 0 25px rgba(56, 189, 248, 0.7), 0 0 50px rgba(56, 189, 248, 0.3)',
    };
  } else if (isDead) {
    borderColor = '#f43f5e';
    textColor = '#f43f5e';
    shadowStyle = { boxShadow: '0 0 20px rgba(244, 63, 94, 0.5)' };
  } else if (isAccept) {
    borderColor = '#10b981';
    textColor = '#10b981';
    shadowStyle = { boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)' };
  } else if (isSourcePending) {
    borderColor = '#a78bfa';
    textColor = '#c4b5fd';
    shadowStyle = { boxShadow: '0 0 20px rgba(167, 139, 250, 0.5)' };
  }

  const showHoverMenu = showMenu && canvasMode === 'select';

  return (
    <div
      className="relative flex items-center justify-center"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{ cursor: canvasMode === 'addTransition' ? 'crosshair' : 'pointer' }}
    >
      {/* Start state arrow indicator */}
      {isStart && (
        <div
          className="absolute flex items-center pointer-events-none"
          style={{ right: 'calc(100% + 4px)', top: '50%', transform: 'translateY(-50%)' }}
        >
          <div
            className="h-[2px]"
            style={{
              width: 30,
              background: 'linear-gradient(to right, transparent, #38bdf8)',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />
          <div
            style={{
              width: 0, height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '9px solid #38bdf8',
              filter: 'drop-shadow(0 0 4px #38bdf8)',
            }}
          />
        </div>
      )}

      {/* Hover action menu */}
      <AnimatePresence>
        {showHoverMenu && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute flex gap-1 z-50 nodrag nopan p-1 rounded-xl"
            style={{
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onSetStart(id); }}
              title="Set as start state"
              className="flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold font-mono transition-all"
              style={{
                background: isStart ? '#0284c7' : 'rgba(30, 48, 84, 0.6)',
                border: `1px solid ${isStart ? '#38bdf8' : 'rgba(71, 85, 105, 0.5)'}`,
                color: isStart ? '#ffffff' : '#94a3b8',
              }}
            >
              S
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleAccept(id); }}
              title="Toggle accept state"
              className="flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold font-mono transition-all"
              style={{
                background: isAccept ? 'rgba(16, 185, 129, 0.3)' : 'rgba(30, 48, 84, 0.6)',
                border: `1px solid ${isAccept ? '#10b981' : 'rgba(71, 85, 105, 0.5)'}`,
                color: isAccept ? '#10b981' : '#94a3b8',
              }}
            >
              A
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              title="Delete state"
              className="flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold transition-all text-slate-400 hover:text-rose-400 hover:bg-rose-500/20"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: 58,
          height: 58,
          border: `2px solid ${borderColor}`,
          background: 'linear-gradient(135deg, #111a2e 0%, #0a0f1d 100%)',
          transition: 'border-color 0.25s, color 0.25s',
          ...shadowStyle,
        }}
        animate={isActive ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={isActive ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.25 }}
      >
        {/* Accept state inner ring */}
        {isAccept && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 4,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '50%',
              opacity: 0.85,
            }}
          />
        )}

        {/* Label / Edit input */}
        {editing ? (
          <input
            ref={inputRef}
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            className="w-12 text-center bg-transparent border-none outline-none font-mono text-xs font-bold"
            style={{ color: textColor }}
            maxLength={8}
          />
        ) : (
          <span
            className="font-mono text-sm font-bold z-10 leading-none"
            style={{ color: textColor, userSelect: 'none' }}
          >
            {label}
          </span>
        )}

        {/* Active pulse aura */}
        {isActive && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: -8,
              border: '2px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '50%',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* Hidden connector handles */}
      <Handle type="source" position={Position.Top}    id="s-t"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  id="s-r"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} id="s-b"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left}   id="s-l"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    id="t-t"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right}  id="t-r"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} id="t-b"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}   id="t-l"  style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
export default CustomNode;
