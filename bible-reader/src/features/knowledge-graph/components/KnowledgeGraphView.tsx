import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GraphEdge, GraphNodeType, PositionedNode, GraphFilters, GraphNode } from '../../../types';
import { NODE_COLORS, NODE_LABELS } from '../../../types';
import { buildGraphData, applyFilters } from '../services/KnowledgeGraphService';
import type { GraphData } from '../services/KnowledgeGraphService';
import GraphFilterPanel from './GraphFilterPanel';
import LoadingIndicator from '../../shared/components/LoadingIndicator';

const REPULSION = 8000, ATTRACTION = 0.005, IDEAL_LENGTH = 160, GRAVITY = 0.002, DAMPING = 0.85;
const MAX_TICKS = 200, NODE_RADIUS = 7, MAX_VISIBLE_NODES = 300;
const ALL_TYPES: GraphNodeType[] = ['passage', 'note', 'bookmark', 'prayer', 'collection', 'project', 'catechism', 'summa'];
const EDGE_COLORS: Record<string, string> = { references: '#5f7fb0', linked_to: '#8b7bb0', part_of: '#6d9e76', mentions: '#b08a5f', contains: '#b09a5f' };
const BATCH_INTERVAL = 80;

type KnowledgeGraphViewProps = { onNodeClick: (type: GraphNodeType, id: string) => void };

function initPositions(nodes: GraphNode[], cache: Map<string, { x: number; y: number }>): PositionedNode[] {
  return nodes.map((n) => {
    const p = cache.get(n.id) ?? { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 };
    if (!cache.has(n.id)) cache.set(n.id, p);
    return { ...n, ...p, vx: 0, vy: 0 };
  });
}

function tickForce(nodes: PositionedNode[], edges: GraphEdge[], w: number, h: number) {
  const cx = w / 2, cy = h / 2;
  const len = nodes.length;
  for (let i = 0; i < len; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < len; j++) {
      const b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const f = REPULSION / (d * d);
      a.vx -= (dx / d) * f; a.vy -= (dy / d) * f;
      b.vx += (dx / d) * f; b.vy += (dy / d) * f;
    }
  }
  for (const edge of edges) {
    const s = nodes.find((n) => n.id === edge.source);
    const t = nodes.find((n) => n.id === edge.target);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const f = (d - IDEAL_LENGTH) * ATTRACTION;
    s.vx += (dx / d) * f; s.vy += (dy / d) * f;
    t.vx -= (dx / d) * f; t.vy -= (dy / d) * f;
  }
  for (const node of nodes) {
    node.vx += (cx - node.x) * GRAVITY; node.vy += (cy - node.y) * GRAVITY;
    node.vx *= DAMPING; node.vy *= DAMPING;
    node.x += node.vx; node.y += node.vy;
  }
}

export default function KnowledgeGraphView({ onNodeClick }: KnowledgeGraphViewProps) {
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
  const [size, setSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const posCacheRef = useRef(new Map<string, { x: number; y: number }>());
  const nodesRef = useRef<PositionedNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const tickRef = useRef(0);
  const rAFRef = useRef<number>(0);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSim = useCallback(() => {
    if (rAFRef.current) { cancelAnimationFrame(rAFRef.current); rAFRef.current = 0; }
    if (batchTimerRef.current) { clearTimeout(batchTimerRef.current); batchTimerRef.current = null; }
  }, []);

  const scheduleBatchUpdate = useCallback(() => {
    if (batchTimerRef.current) return;
    batchTimerRef.current = setTimeout(() => {
      batchTimerRef.current = null;
      setPositionedNodes([...nodesRef.current]);
    }, BATCH_INTERVAL);
  }, []);

  const simLoop = useCallback(() => {
    if (nodesRef.current.length === 0 || tickRef.current >= MAX_TICKS) return;
    tickRef.current++;
    tickForce(nodesRef.current, edgesRef.current, size.width, size.height);
    scheduleBatchUpdate();
    rAFRef.current = requestAnimationFrame(simLoop);
  }, [size, scheduleBatchUpdate]);

  const startSim = useCallback((nodes: PositionedNode[], edges: GraphEdge[]) => {
    stopSim();
    nodesRef.current = nodes;
    edgesRef.current = edges;
    tickRef.current = 0;
    if (nodes.length > 0) rAFRef.current = requestAnimationFrame(simLoop);
  }, [stopSim, simLoop]);

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
      startSim(positioned, data.edges);
    });
    return () => { active = false; stopSim(); };
  }, [startSim, stopSim]);

  useEffect(() => {
    if (!graphData) return;
    stopSim();
    const { nodes, edges } = applyFilters(graphData, filters);
    if (nodes.length > MAX_VISIBLE_NODES) {
      const limited = nodes.slice(0, MAX_VISIBLE_NODES);
      const limitedIds = new Set(limited.map((n) => n.id));
      setPositionedNodes(limited.map((n) => ({ ...n, x: 100 + Math.random() * 600, y: 100 + Math.random() * 400, vx: 0, vy: 0 })));
      setFilteredEdges(edges.filter((e) => limitedIds.has(e.source) && limitedIds.has(e.target)));
    } else {
      const positioned = initPositions(nodes, posCacheRef.current);
      setPositionedNodes(positioned);
      setFilteredEdges(edges);
      startSim(positioned, edges);
    }
  }, [graphData, filters, startSim, stopSim]);

  useEffect(() => {
    if (!containerRef.current) return;
    let frame = 0;
    const obs = new ResizeObserver((entries) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const entry of entries) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      });
    });
    obs.observe(containerRef.current);
    return () => { obs.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.2, Math.min(5, z * (e.deltaY > 0 ? 0.9 : 1.1))));
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

  const handleNodePointerDown = useCallback((e: React.PointerEvent, type: GraphNodeType, id: string) => {
    e.stopPropagation();
    if (filters.depth !== 'all') setFilters((f) => ({ ...f, focusedNodeId: id }));
    onNodeClick(type, id);
  }, [onNodeClick, filters.depth]);

  const handleNodeKeyDown = useCallback((e: React.KeyboardEvent, type: GraphNodeType, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(type, id); }
  }, [onNodeClick]);

  const handleFilterKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); setShowFilters(false); }
  }, []);

  const allTags = useMemo(() => {
    if (!graphData) return [];
    const s = new Set<string>();
    for (const n of graphData.nodes) n.tags?.forEach((t) => s.add(t));
    return [...s].sort();
  }, [graphData]);

  const nodeLimitExceeded = graphData && graphData.nodes.length > MAX_VISIBLE_NODES;

  const vw = size.width, vh = size.height;

  const nodeCircles = useMemo(() => positionedNodes.map((node) => (
    <g key={node.id}
      role="button" tabIndex={0} aria-label={`${NODE_LABELS[node.type]}: ${node.label}${node.subtitle ? ` (${node.subtitle})` : ''}`}
      onPointerDown={(e) => handleNodePointerDown(e, node.type, node.id)}
      onKeyDown={(e) => handleNodeKeyDown(e, node.type, node.id)}
      className="cursor-pointer hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 rounded"
    >
      <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill={NODE_COLORS[node.type] ?? '#9ca3af'} stroke="var(--border)" strokeWidth={1.5} />
      <text x={node.x + NODE_RADIUS + 4} y={node.y + 3} fontSize={10} fill="var(--text)" className="select-none pointer-events-none">{node.label}</text>
    </g>
  )), [positionedNodes, handleNodePointerDown, handleNodeKeyDown]);

  const edgeLines = useMemo(() => filteredEdges.map((edge) => {
    const s = positionedNodes.find((n) => n.id === edge.source);
    const t = positionedNodes.find((n) => n.id === edge.target);
    if (!s || !t) return null;
    return (
      <g key={edge.id}>
        <line x1={s.x} y1={s.y} x2={t.x} y2={t.y}
          stroke={EDGE_COLORS[edge.type] ?? '#d1d5db'} strokeWidth={1}
          strokeDasharray={edge.type === 'mentions' ? '4,3' : undefined} />
        <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 4}
          textAnchor="middle" fontSize={8} fill="#9ca3af" className="select-none pointer-events-none">{edge.type}</text>
      </g>
    );
  }), [filteredEdges, positionedNodes]);

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <button type="button"
        onClick={() => setShowFilters((s) => !s)}
        aria-expanded={showFilters}
        className="absolute left-3 top-3 z-20 rounded border border-theme bg-card px-2.5 py-1.5 text-xs shadow transition-colors hover-bg focus-visible:ring-2 focus-visible:ring-accent">
        {showFilters ? '\u2715 Hide Filters' : '\u2630 Filters'}
      </button>
      {showFilters && graphData && (
        <div className="z-10 w-56 shrink-0 border-r border-theme bg-panel overflow-y-auto" role="region" aria-label="Graph filters" onKeyDown={handleFilterKeyDown}>
          <GraphFilterPanel filters={filters} onChange={setFilters} allTags={allTags} collections={graphData.collections} projects={graphData.projects} />
        </div>
      )}
      <div className="relative flex-1">
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2" role="toolbar" aria-label="Graph zoom controls">
          <button type="button" onClick={() => setZoom((z) => Math.min(5, z * 1.2))} aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded border border-theme bg-card text-sm shadow hover-bg focus-visible:ring-2 focus-visible:ring-accent">+</button>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.2, z * 0.8))} aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded border border-theme bg-card text-sm shadow hover-bg focus-visible:ring-2 focus-visible:ring-accent">&minus;</button>
          <button type="button" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} aria-label="Reset view"
            className="flex h-7 w-7 items-center justify-center rounded border border-theme bg-card text-xs shadow hover-bg focus-visible:ring-2 focus-visible:ring-accent">R</button>
        </div>
        {loading ? (
          <LoadingIndicator message="Charting the connections…" className="h-full" />
        ) : positionedNodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm italic opacity-50" role="status">No data matches the current filters.</div>
        ) : (
          <div ref={containerRef} className="h-full w-full"
            onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
            onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
            style={{ cursor: dragging ? 'grabbing' : pannedGraph ? 'grab' : 'default' }}
            role="img" aria-label={`Knowledge graph with ${positionedNodes.length} nodes and ${filteredEdges.length} connections`}>
            <svg viewBox={`0 0 ${vw} ${vh}`} className="h-full w-full" aria-hidden="true">
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {edgeLines}
                {nodeCircles}
              </g>
            </svg>
          </div>
        )}
        {!loading && positionedNodes.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-lg border border-theme bg-card/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm" role="list" aria-label="Node type legend">
            {ALL_TYPES.map((type) => (
              <span key={type} role="listitem"
                className={`flex items-center gap-1 ${filters.nodeTypes.includes(type) ? '' : 'opacity-30'}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }} aria-hidden="true" />
                {NODE_LABELS[type]}
              </span>
            ))}
          </div>
        )}
        {filters.focusedNodeId && filters.depth !== 'all' && (
          <div className="absolute bottom-3 right-3 z-10 rounded-lg border border-theme bg-card/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm" role="status" aria-live="polite">
            Focused: {positionedNodes.find((n) => n.id === filters.focusedNodeId)?.label ?? filters.focusedNodeId}
          </div>
        )}
        {nodeLimitExceeded && (
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-lg border border-theme bg-card px-4 py-2 text-xs shadow-sm" role="alert">
            Showing {MAX_VISIBLE_NODES} of {graphData.nodes.length} nodes. Refine filters or increase depth.
          </div>
        )}
      </div>
    </div>
  );
}
