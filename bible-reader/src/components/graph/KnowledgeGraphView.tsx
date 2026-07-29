import { useCallback, useEffect, useRef, useState } from 'react';
import type { GraphEdge, GraphNodeType, PositionedNode } from '../../types';
import { NODE_COLORS, NODE_LABELS } from '../../types';
import { buildGraphData } from '../../lib/services/KnowledgeGraphService';

const REPULSION = 8000;
const ATTRACTION = 0.005;
const IDEAL_LENGTH = 160;
const GRAVITY = 0.002;
const DAMPING = 0.85;
const MAX_TICKS = 200;
const NODE_RADIUS = 7;
const EDGE_COLORS: Record<string, string> = {
  references: '#93c5fd',
  linked_to: '#c4b5fd',
  part_of: '#86efac',
  mentions: '#fdba74',
  contains: '#fcd34d',
};

type Props = {
  onNodeClick: (type: GraphNodeType, id: string) => void;
};

let tickCount = 0;

function simulate(nodes: PositionedNode[], edges: GraphEdge[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  for (const a of nodes) {
    for (const b of nodes) {
      if (a.id >= b.id) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = REPULSION / (dist * dist);
      a.vx -= (dx / dist) * force;
      a.vy -= (dy / dist) * force;
      b.vx += (dx / dist) * force;
      b.vy += (dy / dist) * force;
    }
  }
  for (const edge of edges) {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    if (!source || !target) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const force = (dist - IDEAL_LENGTH) * ATTRACTION;
    source.vx += (dx / dist) * force;
    source.vy += (dy / dist) * force;
    target.vx -= (dx / dist) * force;
    target.vy -= (dy / dist) * force;
  }
  for (const node of nodes) {
    node.vx += (cx - node.x) * GRAVITY;
    node.vy += (cy - node.y) * GRAVITY;
    node.vx *= DAMPING;
    node.vy *= DAMPING;
    node.x += node.vx;
    node.y += node.vy;
    node.x = Math.max(10, Math.min(width - 10, node.x));
    node.y = Math.max(10, Math.min(height - 10, node.y));
  }
}

function getNodeColor(type: GraphNodeType): string {
  return NODE_COLORS[type] ?? '#9ca3af';
}

export default function KnowledgeGraphView({ onNodeClick }: Props) {
  const [nodes, setNodes] = useState<PositionedNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pannedGraph, setPannedGraph] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    let active = true;
    setLoading(true);
    void buildGraphData().then((data) => {
      if (!active) return;
      const positioned: PositionedNode[] = data.nodes.map((n) => ({
        ...n,
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 400,
        vx: 0,
        vy: 0,
      }));
      setEdges(data.edges);
      setNodes(positioned);
      setLoading(false);
      tickCount = 0;
      if (data.nodes.length === 0) return;
      const w = 800, h = 600;
      const id = setInterval(() => {
        simulate(positioned, data.edges, w, h);
        setNodes([...positioned]);
        tickCount++;
        if (tickCount >= MAX_TICKS) clearInterval(id);
      }, 16);
      return () => clearInterval(id);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.2, Math.min(5, z * factor)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || (e.target as Element).tagName === 'circle') return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setPannedGraph(true);
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, type: GraphNodeType, id: string) => {
    e.stopPropagation();
    onNodeClick(type, id);
  }, [onNodeClick]);

  const vw = size.width;
  const vh = size.height;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button type="button" onClick={() => setZoom((z) => Math.min(5, z * 1.2))} className="flex h-7 w-7 items-center justify-center rounded border bg-white text-sm shadow hover:bg-gray-50">+</button>
        <button type="button" onClick={() => setZoom((z) => Math.max(0.2, z * 0.8))} className="flex h-7 w-7 items-center justify-center rounded border bg-white text-sm shadow hover:bg-gray-50">&minus;</button>
        <button type="button" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="flex h-7 w-7 items-center justify-center rounded border bg-white text-xs shadow hover:bg-gray-50">R</button>
      </div>
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm italic opacity-50">Building graph...</div>
      ) : nodes.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm italic opacity-50">No data to graph yet. Add notes, bookmarks, prayers, and projects.</div>
      ) : (
        <div
          ref={containerRef}
          className="h-full w-full"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? 'grabbing' : pannedGraph ? 'grab' : 'default' }}
        >
          <svg viewBox={`0 0 ${vw} ${vh}`} className="h-full w-full" style={{ pointerEvents: pannedGraph ? 'all' : 'all' }}>
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {edges.map((edge) => {
                const source = nodes.find((n) => n.id === edge.source);
                const target = nodes.find((n) => n.id === edge.target);
                if (!source || !target) return null;
                const mx = (source.x + target.x) / 2;
                const my = (source.y + target.y) / 2;
                return (
                  <g key={edge.id}>
                    <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={EDGE_COLORS[edge.type] ?? '#d1d5db'} strokeWidth={1} strokeDasharray={edge.type === 'mentions' ? '4,3' : undefined} />
                    <text x={mx} y={my - 4} textAnchor="middle" fontSize={8} fill="#9ca3af" className="select-none pointer-events-none">{edge.type}</text>
                  </g>
                );
              })}
              {nodes.map((node) => (
                <g
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(e, node.type, node.id)}
                  style={{ cursor: 'pointer' }}
                  className="hover:opacity-80"
                >
                  <title>{`${NODE_LABELS[node.type]}: ${node.label}${node.subtitle ? ` (${node.subtitle})` : ''}`}</title>
                  <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill={getNodeColor(node.type)} stroke="#fff" strokeWidth={1.5} />
                  <text x={node.x + NODE_RADIUS + 4} y={node.y + 3} fontSize={10} fill="#374151" className="select-none pointer-events-none">{node.label}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      )}
      {!loading && nodes.length > 0 && (
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-lg border bg-white/90 px-3 py-2 text-xs shadow-sm">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {NODE_LABELS[type as GraphNodeType]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
