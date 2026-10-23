import { useMemo, useState } from 'react';
import type { GraphData, GraphNode } from '../../utils/api/graph';
import { Badge } from '../ui/Panel';

interface Position {
  x: number;
  y: number;
}

const columnByType: Record<string, number> = {
  Patient: 90,
  Appointment: 310,
  Doctor: 530,
  Specialization: 790,
  Hospital: 790,
  Prescription: 790,
  Medicine: 1050,
  Test: 1050
};

const nodeTone: Record<string, string> = {
  Patient: 'border-sky-300 bg-sky-50 text-sky-900',
  Appointment: 'border-violet-300 bg-violet-50 text-violet-900',
  Doctor: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  Specialization: 'border-amber-300 bg-amber-50 text-amber-900',
  Hospital: 'border-rose-300 bg-rose-50 text-rose-900',
  Prescription: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  Medicine: 'border-cyan-300 bg-cyan-50 text-cyan-900',
  Test: 'border-orange-300 bg-orange-50 text-orange-900'
};

/** A small SVG graph view that renders only the structured API response. */
export function GraphDiagram({ graph }: { graph: GraphData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { positions, height } = useMemo(() => {
    const counts = new Map<string, number>();
    const nextPositions = new Map<string, Position>();
    graph.nodes.forEach((node) => {
      const index = counts.get(node.type) ?? 0;
      counts.set(node.type, index + 1);
      nextPositions.set(node.id, {
        x: columnByType[node.type] ?? 500,
        y: 58 + index * 82
      });
    });
    return { positions: nextPositions, height: Math.max(240, ...Array.from(counts.values()).map((count) => 92 + count * 82)) };
  }, [graph.nodes]);

  const selected: GraphNode | undefined = graph.nodes.find((node) => node.id === selectedId);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
      <div className="overflow-x-auto rounded-md border border-line bg-slate-50 p-2">
        <div className="relative min-w-[1050px]" style={{ height }}>
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox={`0 0 1200 ${height}`} preserveAspectRatio="none">
            <defs>
              <marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="fill-slate-400" />
              </marker>
            </defs>
            {graph.relationships.map((relationship) => {
              const source = positions.get(relationship.source);
              const target = positions.get(relationship.target);
              if (!source || !target) return null;
              const middleX = (source.x + target.x) / 2;
              const middleY = (source.y + target.y) / 2 - 7;
              return (
                <g key={relationship.id}>
                  <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} className="stroke-slate-400" strokeWidth="2" markerEnd="url(#graph-arrow)" />
                  <text x={middleX} y={middleY} textAnchor="middle" className="fill-slate-500 text-[19px] font-medium">{relationship.type}</text>
                </g>
              );
            })}
          </svg>
          {graph.nodes.map((node) => {
            const position = positions.get(node.id);
            if (!position) return null;
            return (
              <button
                key={node.id}
                type="button"
                title={`${node.type}: ${node.label}`}
                aria-pressed={selectedId === node.id}
                onClick={() => setSelectedId(node.id)}
                className={`absolute w-28 -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1.5 text-center text-2xs font-semibold shadow-sm transition hover:ring-2 hover:ring-brand-300 ${nodeTone[node.type] ?? 'border-line bg-white text-ink'} ${selectedId === node.id ? 'ring-2 ring-brand-500' : ''}`}
                style={{ left: `${position.x / 12}%`, top: position.y }}
              >
                <span className="block truncate">{node.label}</span>
                <span className="mt-0.5 block text-[10px] font-medium opacity-70">{node.type}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-md border border-line bg-white p-3">
        <p className="text-2xs font-semibold uppercase tracking-wide text-ink-soft">Node inspector</p>
        {selected ? (
          <div className="mt-3 space-y-2">
            <Badge tone="info">{selected.type}</Badge>
            <p className="break-words text-sm font-semibold text-ink">{selected.label}</p>
            <p className="break-all font-mono text-2xs text-ink-muted">{selected.id}</p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-ink-muted">Select a node to inspect its label and stable graph ID.</p>
        )}
      </aside>
    </div>
  );
}
