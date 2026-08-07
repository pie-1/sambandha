/**
 * Shared building blocks for the simulator views.
 */

import { SIM_COLORS as C, scoreColor } from '../../lib/simulation/constants';

export function Stamp({ label, sub }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0" aria-hidden="true">
      <circle cx="28" cy="28" r="26" fill="none" stroke={C.gold} strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="28" cy="28" r="20" fill="none" stroke={C.gold} strokeWidth="1" />
      <text x="28" y="24" textAnchor="middle" fill={C.gold} fontSize="8" fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">
        {label}
      </text>
      <text x="28" y="34" textAnchor="middle" fill={C.gold} fontSize="7" fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">
        {sub}
      </text>
    </svg>
  );
}

export function PageHeader({ stampLabel, stampSub, title, draftTitle, intro }) {
  return (
    <>
      <div className="mb-1.5 flex items-center gap-4">
        <Stamp label={stampLabel} sub={stampSub} />
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: C.gold }}>
            Sambandh · सम्बन्ध
          </div>
          <h1 className="simulator-title mt-0.5 text-[26px] font-semibold">{title}</h1>
          {draftTitle && (
            <p className="mt-1 text-sm" style={{ color: C.muted }}>
              Draft: {draftTitle}
            </p>
          )}
        </div>
      </div>
      {intro && (
        <p className="mt-2 max-w-[640px] text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
          {intro}
        </p>
      )}
    </>
  );
}

export function BackLink({ onBack }) {
  if (!onBack) return null;
  return (
    <button type="button" onClick={onBack} className="mb-4 text-sm transition hover:opacity-80" style={{ color: C.gold }}>
      ← Back
    </button>
  );
}

export function Panel({ children, className = '', style }) {
  return (
    <div
      className={`rounded-xl p-[18px] ${className}`}
      style={{ background: C.bgPanel, border: `1px solid ${C.line}`, ...style }}
    >
      {children}
    </div>
  );
}

export function MetricCard({ label, value, suffix = '', kind, hint }) {
  const color = kind ? scoreColor(parseFloat(value), kind) : C.gold;
  return (
    <div className="flex-1 min-w-[150px] rounded-[10px] px-[18px] py-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
      <div className="mb-2 text-xs uppercase tracking-wider text-[#9BA0B8]">{label}</div>
      <div className="font-mono text-[30px] font-semibold" style={{ color: kind ? color : C.parchment }}>
        {value}
        <span className="ml-1 text-base text-[#9BA0B8]">{suffix}</span>
      </div>
      {hint && <div className="mt-1.5 text-xs text-[#9BA0B8]">{hint}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, color }) {
  return (
    <div className="flex-1 min-w-[120px] rounded-[10px] px-[16px] py-3.5" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
      <div className="mb-1 text-[11px] uppercase tracking-wider text-[#9BA0B8]">{label}</div>
      <div className="font-mono text-[24px] font-semibold" style={{ color: color || C.parchment }}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-[#9BA0B8]">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
      {children}
    </div>
  );
}

export function StateCard({ running, runningText, emptyText }) {
  if (running) {
    return (
      <div className="rounded-xl px-6 py-[50px] text-center font-mono text-[13.5px]" style={{ border: `1px solid ${C.line}`, color: C.gold }}>
        {runningText}
      </div>
    );
  }
  return (
    <div className="rounded-xl px-6 py-[50px] text-center text-[13.5px]" style={{ border: `1px dashed ${C.line}`, color: C.muted }}>
      {emptyText}
    </div>
  );
}

export function InsightBox({ title = 'Insights', items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-1.5 rounded-[10px] px-4 py-3" style={{ background: 'rgba(217,164,65,0.08)', border: `1px solid ${C.gold}` }}>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
        {title}
      </div>
      <ul className="m-0 list-disc pl-[18px] text-[12.5px] leading-relaxed" style={{ color: C.parchment }}>
        {items.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

export function SourcesFooter({ sources, datasetSize, note }) {
  return (
    <div className="mt-[26px] border-t pt-3.5 text-[11px] leading-relaxed" style={{ borderColor: C.line, color: C.muted }}>
      {datasetSize != null && (
        <div className="mb-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-wider" style={{ color: C.gold }}>
            Reference dataset
          </span>
          : {datasetSize.toLocaleString('en-IN')} records
        </div>
      )}
      {sources?.length > 0 && (
        <div className="mb-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-wider" style={{ color: C.gold }}>
            Sources
          </span>
          : {sources.map((s) => s.name).join(' · ')}
        </div>
      )}
      {note && <div>{note}</div>}
    </div>
  );
}
