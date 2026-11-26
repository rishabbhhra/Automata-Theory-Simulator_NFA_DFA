import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GitBranch, Sparkles } from 'lucide-react';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const nodeTypes = { customNode: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

export default function Canvas({
  states,
  transitions,
  activeStates,
  activeTransitions,
  canvasMode,
  pendingFrom,
  onAddState,
  onPositionUpdate,
  onNodeClickHandler,
  onRemoveState,
  onSetStart,
  onToggleAccept,
  onRenameState,
}) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync states → ReactFlow nodes
  useEffect(() => {
    setNodes(prev => {
      const prevMap = new Map(prev.map(n => [n.id, n]));

      return states.map(s => {
        const existing = prevMap.get(s.id);
        return {
          id: s.id,
          type: 'customNode',
          position: existing?.position ?? s.position,
          data: {
            label: s.label,
            isStart: s.isStart,
            isAccept: s.isAccept,
            isActive: activeStates.includes(s.id),
            isDead: false,
            canvasMode,
            pendingFrom,
            onNodeClick: onNodeClickHandler,
            onRemove: onRemoveState,
            onSetStart,
            onToggleAccept,
            onRename: onRenameState,
          },
          draggable: true,
          selectable: true,
        };
      });
    });
  }, [states, activeStates, canvasMode, pendingFrom, onNodeClickHandler, onRemoveState, onSetStart, onToggleAccept, onRenameState]);

  // Sync transitions → ReactFlow edges
  useEffect(() => {
    const edgeMap = new Map();

    transitions.forEach(t => {
      const key = `${t.from}|||${t.to}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          id: `edge_${t.from}_${t.to}`,
          source: t.from,
          target: t.to,
          isSelf: t.from === t.to,
          labels: [t.label],
          ids: [t.id],
        });
      } else {
        const e = edgeMap.get(key);
        if (!e.labels.includes(t.label)) {
          e.labels.push(t.label);
          e.ids.push(t.id);
        }
      }
    });

    // Detect bidirectional pairs to curve apart
    const pairKeys = new Set();
    for (const key of edgeMap.keys()) {
      const [from, to] = key.split('|||');
      const reverseKey = `${to}|||${from}`;
      if (edgeMap.has(reverseKey) && from !== to) {
        pairKeys.add(key);
        pairKeys.add(reverseKey);
      }
    }

    const stateMap = new Map((states || []).map(s => [s.id, s]));
    const nodeMap = new Map((nodes || []).map(n => [n.id, n]));

    const newEdges = [...edgeMap.values()].map(e => {
      const isActive = e.ids.some(id => activeTransitions.includes(id));
      const key = `${e.source}|||${e.target}`;
      const isBidirectional = pairKeys.has(key);

      let sourceHandle = 's-t';
      let targetHandle = 't-t';
      let curveOffset = 0;

      if (e.isSelf) {
        sourceHandle = 's-t';
        targetHandle = 't-t';
        curveOffset = 0;
      } else {
        const sFrom = stateMap.get(e.source);
        const sTo = stateMap.get(e.target);
        const nFrom = nodeMap.get(e.source);
        const nTo = nodeMap.get(e.target);

        const fromPos = nFrom?.position || sFrom?.position || { x: 0, y: 0 };
        const toPos = nTo?.position || sTo?.position || { x: 0, y: 0 };

        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const isHorizontal = Math.abs(dx) >= Math.abs(dy);

        let isForward;
        if (sFrom?.isStart) {
          isForward = true;
        } else if (sTo?.isStart) {
          isForward = false;
        } else {
          isForward = isHorizontal ? dx >= 0 : dy >= 0;
        }

        if (isBidirectional) {
          if (isHorizontal) {
            if (isForward) {
              sourceHandle = dx >= 0 ? 's-r' : 's-l';
              targetHandle = dx >= 0 ? 't-l' : 't-r';
              curveOffset = -26;
            } else {
              sourceHandle = 's-b';
              targetHandle = 't-b';
              curveOffset = 46;
            }
          } else {
            if (isForward) {
              sourceHandle = 's-r';
              targetHandle = 't-r';
              curveOffset = dy >= 0 ? 36 : -36;
            } else {
              sourceHandle = 's-l';
              targetHandle = 't-l';
              curveOffset = dy >= 0 ? -36 : 36;
            }
          }
        } else {
          if (isHorizontal) {
            sourceHandle = dx >= 0 ? 's-r' : 's-l';
            targetHandle = dx >= 0 ? 't-l' : 't-r';
            curveOffset = 0;
          } else {
            sourceHandle = dy >= 0 ? 's-b' : 's-t';
            targetHandle = dy >= 0 ? 't-t' : 't-b';
            curveOffset = 0;
          }
        }
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle,
        targetHandle,
        type: 'customEdge',
        label: e.labels.join(', '),
        data: {
          isActive,
          isSelf: e.isSelf,
          curveOffset,
        },
        selectable: false,
        focusable: false,
      };
    });

    setEdges(newEdges);
  }, [transitions, activeTransitions, states, nodes]);

  const handlePaneClick = useCallback((event) => {
    if (canvasMode === 'addState') {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onAddState(position);
    }
  }, [canvasMode, screenToFlowPosition, onAddState]);

  const handleNodesChange = useCallback((changes) => {
    changes.forEach(change => {
      if (change.type === 'position' && !change.dragging && change.position) {
        onPositionUpdate(change.id, change.position);
      }
    });
    onNodesChange(changes);
  }, [onNodesChange, onPositionUpdate]);

  const cursorStyle = canvasMode === 'addState'
    ? 'crosshair'
    : canvasMode === 'addTransition'
      ? 'pointer'
      : 'default';

  return (
    <div className="relative flex-1 canvas-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView={false}
        defaultViewport={{ x: 220, y: 160, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2.5}
        style={{ cursor: cursorStyle }}
        panOnDrag={canvasMode === 'select'}
        nodesDraggable={canvasMode !== 'addTransition'}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(56, 189, 248, 0.16)"
          gap={32}
          size={1.5}
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Floating status hints */}
      <AnimatePresence>
        {canvasMode === 'addState' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold pointer-events-none"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              boxShadow: '0 8px 30px rgba(56, 189, 248, 0.25)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Plus size={13} />
            Click anywhere on the canvas to place a state
          </motion.div>
        )}
        {canvasMode === 'addTransition' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold pointer-events-none"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #a78bfa',
              color: '#c4b5fd',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.25)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <GitBranch size={13} />
            {pendingFrom
              ? `Origin "${pendingFrom}" selected → click target state`
              : 'Click origin state to start transition'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State Watermark */}
      {states.length === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
              border: '1.5px dashed rgba(56, 189, 248, 0.25)',
            }}
          >
            <span
              className="text-2xl font-mono font-bold text-sky-400/40"
            >
              q₀
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            Canvas is ready
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles size={12} className="text-sky-400/60" />
            Click "Add State" from the left panel to begin designing
          </p>
        </div>
      )}
    </div>
  );
}
