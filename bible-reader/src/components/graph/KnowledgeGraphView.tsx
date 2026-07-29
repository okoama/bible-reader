import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GraphEdge, GraphNodeType, PositionedNode, GraphFilters, GraphNode } from '../../types';
import { NODE_COLORS, NODE_LABELS } from '../../types';
import { buildGraphData, applyFilters } from '../../lib/services/KnowledgeGraphService';
import type { GraphData } from '../../lib/services/KnowledgeGraphService';
import GraphFilterPanel from './GraphFilterPanel';

const REPULSION = 8000, ATTRACTION = 0.005, IDEAL_LENGTH = 160, GRAVITY = 0.002, DAMPING = 0.85;
const MAX_TICKS = 200, NODE_RADIUS = 7;
const ALL_TYPES: GraphNodeType[] = ['passage', 'note', 'bookmark', 'prayer', 'collection', 'project', 'catechism', 'summa'];
const EDGE_COLORS: Record<string, string> = { references: '#93c5fd', linked_to: '#c4b5fd', part_of: '#86efac', mentions: '#fdba74', contains: '#fcd34d' };

type Props = { onNodeClick: (type: GraphNodeType, id: string) => void };

function initPositions(nodes: GraphNode[], cache: Map<string, { x: number; y: number }>): PositionedNode[] {
  return nodes.map((n) => {
    const p = cache.get(n.id) ?? { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 };
    if (!cache.has(n.id)) cache.set(n.id, p);
    return { ...n, ...p, vx: 0, vy: 0 };
  });
}

export default function KnowledgeGraphView({ onNodeClick }: Props) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pannedGraph, setPannedGraph] = useState(false);
  const [filters, setFilters] = useState<GraphFilters>({ nodeTypes: [...ALL_TYPES], depth: 'all', tags: [] });
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const posCacheRef = useRef(new Map<string, { x: number; y: number }>());
  const tickRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSim = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const startSim = useCallback((nodes: PositionedNode[], edges: GraphEdge[]) => {
    stopSim();
    tickRef.current = 0;
    const w = 800, h = 600;
    timerRef.current = setInterval(() => {
      const cx = w / 2, cy = h / 2;
      for (const a of nodes) { for (const b of nodes) { if (a.id >= b.id) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(Math.sqrt(dx * dx + dy * dy), 1), f = REPULSION / (d * d); a.vx -= (dx / d) * f; a.vy -= (dy / d) * f; b.vx += (dx / d) * f; b.vy += (dy / d) * f; } }
      for (const edge of edges) { const s = nodes.find((n) => n.id === edge.source), t = nodes.find((n) => n.id === edge.target); if (!s || !t) continue; const dx = t.x - s.x, dy = t.y - s.y, d = Math.max(Math.sqrt(dx * dx + dy * dy), 1), f = (d - IDEAL_LENGTH) * ATTRACTION; s.vx += (dx / d) * f; s.vy += (dy / d) * f; t.vx -= (dx / d) * f; t.vy -= (dy / d) * f; }
      for (const node of nodes) { node.vx += (cx - node.x) * GRAVITY; node.vy += (cy - node.y) * GRAVITY; node.vx *= DAMPING; node.vy *= DAMPING; node.x += node.vx; node.y += node.vy; }
      setPositionedNodes([...nodes]);
      tickRef.current++;
      if (tickRef.current >= MAX_TICKS) stopSim();
    }, 16);
  }, [stopSim]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void buildGraphData().then((data) => {
      if (!active) return;
      setGraphData(data);
      const positioned = initPositions(data.nodes, posCacheRef.current);
      setPositionedNodes(positioned);
      setFilteredEdges(data.edges);
      setLoading(false);
      if (data.nodes.length > 0) startSim(positioned, data.edges);
    });
    return () => { active = false; stopSim(); };
  }, [startSim, stopSim]);

  useEffect(() => {
    if (!graphData) return;
    stopSim();
    const { nodes, edges } = applyFilters(graphData, filters);
    const positioned = initPositions(nodes, posCacheRef.current);
    setPositionedNodes(positioned);
    setFilteredEdges(edges);
    if (nodes.length > 0) startSim(positioned, edges);
  }, [graphData, filters, startSim, stopSim]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => { for (const entry of entries) setSize({ width: entry.contentRect.width, height: entry.contentRect.height }); });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => { e.preventDefault(); setZoom((z) => Math.max(0.2, Math.min(5, z * (e.deltaY > 0 ? 0.9 : 1.1)))); }, []);
  const handleMouseDown = useCallback((e: React.MouseEvent) => { if (e.button !== 0 || (e.target as Element).tagName === 'circle') return; setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); setPannedGraph(true); }, [pan]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!dragging) return; setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }, [dragging, dragStart]);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, type: GraphNodeType, id: string) => {
    e.stopPropagation();
    if (filters.depth !== 'all') setFilters((f) => ({ ...f, focusedNodeId: id }));
    onNodeClick(type, id);
  }, [onNodeClick, filters.depth]);

  const allTags = useMemo(() => { if (!graphData) return []; const s = new Set<string>(); for (const n of graphData.nodes) n.tags?.forEach((t) => s.add(t)); return [...s].sort(); }, [graphData]);

  const vw = size.width, vh = size.height;

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <button type="button" onClick={() => setShowFilters((s) => !s)} className="absolute left-3 top-3 z-20 rounded border bg-white px-2.5 py-1.5 text-xs shadow transition-colors hover:bg-gray-50">{showFilters ? '\u2715 Hide Filters' : '\u2630 Filters'}</button>
      {showFilters && graphData && (
        <div className="z-10 w-56 shrink-0 border-r bg-white overflow-y-auto">
          <GraphFilterPanel filters={filters} onChange={setFilters} allTags={allTags} collections={graphData.collections} projects={graphData.projects} />
        </div>
      )}
      <div className="relative flex-1">
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button type="button" onClick={() => setZoom((z) => Math.min(5, z * 1.2))} className="flex h-7 w-7 items-center justify-center rounded border bg-white text-sm shadow hover:bg-gray-50">+</button>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.2, z * 0.8))} className="flex h-7 w-7 items-center justify-center rounded border bg-white text-sm shadow hover:bg-gray-50">&minus;</button>
          <button type="button" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="flex h-7 w-7 items-center justify-center rounded border bg-white text-xs shadow hover:bg-gray-50">R</button>
        </div>
        {loading ? <div className="flex h-full items-center justify-center text-sm italic opacity-50">Building graph...</div>
        : positionedNodes.length === 0 ? <div className="flex h-full items-center justify-center text-sm italic opacity-50">No data matches the current filters.</div>
        : <div ref={containerRef} className="h-full w-full" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} style={{ cursor: dragging ? 'grabbing' : pannedGraph ? 'grab' : 'default' }}>
            <svg viewBox={`0 0 ${vw} ${vh}`} className="h-full w-full">
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {filteredEdges.map((edge) => { const s = positionedNodes.find((n) => n.id === edge.source), t = positionedNodes.find((n) => n.id === edge.target); if (!s || !t) return null; const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2; return <g key={edge.id}><line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={EDGE_COLORS[edge.type] ?? '#d1d5db'} strokeWidth={1} strokeDasharray={edge.type === 'mentions' ? '4,3' : undefined} /><text x={mx} y={my - 4} textAnchor="middle" fontSize={8} fill="#9ca3af" className="select-none pointer-events-none">{edge.type}</text></g>; })}
                {positionedNodes.map((node) => (<g key={node.id} onPointerDown={(e) => handleNodePointerDown(e, node.type, node.id)} style={{ cursor: 'pointer' }} className="hover:opacity-80"><title>{`${NODE_LABELS[node.type]}: ${node.label}${node.subtitle ? ` (${node.subtitle})` : ''}`}</title><circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill={NODE_COLORS[node.type] ?? '#9ca3af'} stroke="#fff" strokeWidth={1.5} /><text x={node.x + NODE_RADIUS + 4} y={node.y + 3} fontSize={10} fill="#374151" className="select-none pointer-events-none">{node.label}</text></g>))}
              </g>
            </svg>
          </div>
        }
        {!loading && positionedNodes.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-lg border bg-white/90 px-3 py-2 text-xs shadow-sm">
            {ALL_TYPES.map((type) => <span key={type} className={`flex items-center gap-1 ${filters.nodeTypes.includes(type) ? '' : 'opacity-30'}`}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }} />{NODE_LABELS[type]}</span>)}
          </div>
        )}
        {filters.focusedNodeId && filters.depth !== 'all' && <div className="absolute bottom-3 right-3 z-10 rounded-lg border bg-white/90 px-3 py-2 text-xs shadow-sm">Focused: {positionedNodes.find((n) => n.id === filters.focusedNodeId)?.label ?? filters.focusedNodeId}</div>}
      </div>
    </div>
  );
}
