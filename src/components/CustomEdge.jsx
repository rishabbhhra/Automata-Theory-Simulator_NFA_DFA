import { memo } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { motion } from 'framer-motion';

const CustomEdge = memo(({
  id,
  sourceX, sourceY,
  targetX, targetY,
  label,
  data,
  selected,
}) => {
  const isActive = data?.isActive ?? false;
  const isSelf = data?.isSelf ?? false;
  const curveOffset = data?.curveOffset ?? 0;

  let edgePath, labelX, labelY, arrowX, arrowY, arrowAngle;

  if (isSelf) {
    // Self-loop: draw a clean circular loop above the node
    const loopSize = 22;
    const cx = sourceX;
    const startY = sourceY + 2;
    const cy = startY - loopSize * 2.4;
    const p0 = { x: sourceX - 8, y: startY };
    const p1 = { x: sourceX - loopSize * 1.6, y: cy };
    const p2 = { x: sourceX + loopSize * 1.6, y: cy };
    const p3 = { x: sourceX + 8, y: startY };

    edgePath = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
    labelX = cx;
    labelY = cy - 4;

    const t = 0.72;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    arrowX = mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x;
    arrowY = mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y;
    const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
    const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);
    arrowAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  } else if (curveOffset !== 0) {
    // Curved edge
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const canonicalDx = Math.abs(targetX - sourceX) || 1;
    const canonicalDy = sourceX <= targetX ? (targetY - sourceY) : (sourceY - targetY);
    const len = Math.sqrt(canonicalDx * canonicalDx + canonicalDy * canonicalDy) || 1;
    const px = -canonicalDy / len;
    const py = canonicalDx / len;
    const ctrlX = midX + px * curveOffset;
    const ctrlY = midY + py * curveOffset;
    edgePath = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;

    arrowX = (sourceX + 2 * ctrlX + targetX) / 4;
    arrowY = (sourceY + 2 * ctrlY + targetY) / 4;
    arrowAngle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);

    const dir = curveOffset >= 0 ? 1 : -1;
    labelX = arrowX + px * dir * 20;
    labelY = arrowY + py * dir * 20;
  } else {
    // Straight transition edge
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

    arrowX = midX;
    arrowY = midY;
    arrowAngle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);

    const canonicalDx = Math.abs(targetX - sourceX) || 1;
    const canonicalDy = sourceX <= targetX ? (targetY - sourceY) : (sourceY - targetY);
    const len = Math.sqrt(canonicalDx * canonicalDx + canonicalDy * canonicalDy) || 1;
    const px = -canonicalDy / len;
    const py = canonicalDx / len;
    labelX = midX - px * 20;
    labelY = midY - py * 20;
  }

  const strokeColor = isActive ? '#38bdf8' : selected ? '#a78bfa' : '#64748b';
  const strokeWidth = isActive ? 2.5 : 1.75;
  const glowFilter = isActive
    ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.9))'
    : 'none';

  return (
    <>
      {/* Background glow stroke when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth={8}
          strokeLinecap="round"
        />
      )}

      {/* Main edge path */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          filter: glowFilter,
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
      />

      {/* Direction arrowhead */}
      <g
        transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})`}
        style={{
          filter: glowFilter,
          pointerEvents: 'none',
        }}
      >
        <path
          d="M -7 -5 L 6 0 L -7 5 Z"
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>

      {/* Traveling animated particle along active edge */}
      {isActive && (
        <circle
          r={4}
          fill="#38bdf8"
          style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
        >
          <animateMotion
            dur="0.6s"
            repeatCount="indefinite"
            path={edgePath}
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </circle>
      )}

      {/* Transition Label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
          >
            <motion.div
              animate={isActive ? {
                scale: [1, 1.15, 1],
                transition: { duration: 0.4 },
              } : {}}
              className="font-mono font-bold px-2 py-0.5 rounded-md"
              style={{
                background: isActive
                  ? '#0284c7'
                  : selected
                    ? 'rgba(139, 92, 246, 0.25)'
                    : 'rgba(15, 23, 42, 0.9)',
                border: `1px solid ${isActive ? '#38bdf8' : selected ? '#a78bfa' : 'rgba(71, 85, 105, 0.6)'}`,
                color: isActive ? '#ffffff' : selected ? '#c4b5fd' : '#e2e8f0',
                backdropFilter: 'blur(8px)',
                boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.6)' : '0 2px 8px rgba(0,0,0,0.4)',
                fontSize: '11px',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </motion.div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
