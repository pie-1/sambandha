/**
 * Policy Impact Simulator
 * Interactive UI backed by /api/simulate
 */

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import API from '../../api/endpoints';
import toast from 'react-hot-toast';
import { PROVINCES, SECTORS, SIM_COLORS as C, clamp, scoreColor } from '../../lib/simulation/constants';

function Stamp() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r="26" fill="none" stroke={C.gold} strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="28" cy="28" r="20" fill="none" stroke={C.gold} strokeWidth="1" />
      <text x="28" y="24" textAnchor="middle" fill={C.gold} fontSize="8" fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">
        SIMULATED
      </text>
      <text x="28" y="34" textAnchor="middle" fill={C.gold} fontSize="7" fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">
        v0.1 DEMO
      </text>
    </svg>
  );
}

function MetricCard({ label, value, suffix, kind, hint }) {
  const color = kind ? scoreColor(parseFloat(value), kind) : C.gold;
  return (
    <div
      className="flex-1 min-w-[150px] rounded-[10px] px-[18px] py-4"
      style={{ background: C.bgCard, border: `1px solid ${C.line}` }}
    >
      <div className="mb-2 text-xs uppercase tracking-wider text-[#9BA0B8]">{label}</div>
      <div className="font-mono text-[30px] font-semibold" style={{ color: kind ? color : C.parchment }}>
        {value}
        <span className="ml-1 text-base text-[#9BA0B8]">{suffix}</span>
      </div>
      {hint && <div className="mt-1.5 text-xs text-[#9BA0B8]">{hint}</div>}
    </div>
  );
}

function LedgerCard({ match, rank }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg px-3.5 py-3"
      style={{ background: C.bgPanel, border: `1px solid ${C.line}` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${C.line} 0, ${C.line} 1px, transparent 1px, transparent 14px)`,
        }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[13px] font-semibold" style={{ color: C.parchment }}>
            {match.icon} {match.province}
          </div>
          <div className="mt-0.5 text-[11px] text-[#9BA0B8]">
            {match.sector} · FY {match.year} BS · NPR {match.budget} cr
          </div>
        </div>
        <div
          className="rounded border px-1.5 py-px font-mono text-[10px]"
          style={{ color: C.gold, borderColor: C.gold }}
        >
          #{rank}
        </div>
      </div>
      <div className="relative mt-2.5 flex gap-3.5 font-mono text-[11px]">
        <span style={{ color: scoreColor(match.efficiency, 'good-high') }}>Eff {match.efficiency}%</span>
        <span style={{ color: scoreColor(match.completion, 'good-high') }}>Comp {match.completion}%</span>
        <span style={{ color: scoreColor(match.overrun, 'good-low') }}>Overrun {match.overrun}%</span>
        <span className="text-[#9BA0B8]">Jobs {match.jobs}</span>
      </div>
    </div>
  );
}

export default function PolicyImpactSimulator({
  draftId = null,
  draftTitle = null,
  initialProvince = 'Bagmati',
  initialSectorIdx = 0,
  initialBudget = 5,
  onBack,
}) {
  const [province, setProvince] = useState(initialProvince);
  const [sectorIdx, setSectorIdx] = useState(initialSectorIdx);
  const [budget, setBudget] = useState(initialBudget);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const sector = SECTORS[sectorIdx];

  const chartData = useMemo(() => {
    if (!result) return [];
    return [
      { name: 'Efficiency', Draft: result.efficiency, 'Sector avg': result.sectorAvg.efficiency },
      { name: 'Completion', Draft: result.completion, 'Sector avg': result.sectorAvg.completion },
      { name: 'Overrun risk', Draft: result.overrun, 'Sector avg': result.sectorAvg.overrun },
    ];
  }, [result]);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data } = await axiosClient.post(API.SIMULATOR, {
        draftId,
        province,
        sectorName: sector.name,
        budget,
      });
      setResult(data.data);
    } catch {
      toast.error('Simulation failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      className="simulator-root min-h-full px-6 py-7 pb-10 font-sans"
      style={{ background: C.bg, color: C.parchment }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm transition hover:opacity-80"
          style={{ color: C.gold }}
        >
          ← Back
        </button>
      )}

      <div className="mb-1.5 flex items-center gap-4">
        <Stamp />
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: C.gold }}>
            Sambandh · सम्बन्ध
          </div>
          <h1 className="simulator-title mt-0.5 text-[26px] font-semibold">Policy Impact Simulator</h1>
          {draftTitle && (
            <p className="mt-1 text-sm" style={{ color: C.muted }}>
              Draft: {draftTitle}
            </p>
          )}
        </div>
      </div>

      <p className="mt-2 max-w-[620px] text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
        Compares a draft provincial or local development budget against similar past decisions and shows a likely
        range of effects — an evidence-based comparison, not a guaranteed prediction.
      </p>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl p-[18px]" style={{ background: C.bgPanel, border: `1px solid ${C.line}` }}>
          <div className="mb-2.5 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
            Province
          </div>
          <div className="mb-[18px] grid grid-cols-2 gap-1.5">
            {PROVINCES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setProvince(p);
                  setResult(null);
                }}
                className="rounded-md px-2 py-1.5 text-[12.5px] transition"
                style={{
                  border: `1px solid ${p === province ? C.gold : C.line}`,
                  background: p === province ? 'rgba(217,164,65,0.14)' : 'transparent',
                  color: p === province ? C.gold : C.parchment,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mb-2.5 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
            Sector
          </div>
          <div className="mb-[18px] flex flex-col gap-1">
            {SECTORS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  setSectorIdx(i);
                  setBudget(clamp(budget, s.min, s.max));
                  setResult(null);
                }}
                className="rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition"
                style={{
                  border: `1px solid ${i === sectorIdx ? C.gold : C.line}`,
                  background: i === sectorIdx ? 'rgba(217,164,65,0.14)' : 'transparent',
                  color: i === sectorIdx ? C.gold : C.parchment,
                }}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>

          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
            Draft budget — NPR crore
          </div>
          <div className="mb-1 flex items-center gap-2.5">
            <input
              type="range"
              min={sector.min}
              max={sector.max}
              step={0.1}
              value={budget}
              onChange={(e) => {
                setBudget(parseFloat(e.target.value));
                setResult(null);
              }}
              className="simulator-range flex-1"
            />
            <input
              type="number"
              value={budget}
              min={sector.min}
              max={sector.max}
              step={0.1}
              onChange={(e) => {
                setBudget(clamp(parseFloat(e.target.value) || sector.min, sector.min, sector.max));
                setResult(null);
              }}
              className="simulator-number w-16 rounded-md px-2 py-1.5 font-mono"
            />
          </div>
          <div className="mb-5 text-[11px]" style={{ color: C.muted }}>
            Typical range for this sector: {sector.min}–{sector.max} crore
          </div>

          <button
            type="button"
            onClick={run}
            disabled={running}
            className="w-full rounded-lg py-2.5 text-sm font-semibold tracking-wide text-white transition disabled:cursor-default"
            style={{ background: running ? C.crimsonDeep : C.crimson }}
          >
            {running ? 'Comparing to precedent…' : result ? 'Re-run simulation' : 'Run simulation'}
          </button>
        </div>

        <div>
          {!result && !running && (
            <div
              className="rounded-xl px-6 py-[50px] text-center text-[13.5px]"
              style={{ border: `1px dashed ${C.line}`, color: C.muted }}
            >
              Set a province, sector and budget, then run the simulation to see matched precedents and predicted
              outcomes.
            </div>
          )}

          {running && (
            <div
              className="rounded-xl px-6 py-[50px] text-center font-mono text-[13.5px]"
              style={{ border: `1px solid ${C.line}`, color: C.gold }}
            >
              Matching draft budget against historical ledger…
            </div>
          )}

          {result && !running && (
            <>
              <div className="mb-4 flex flex-wrap gap-3">
                <MetricCard label="Estimated local jobs" value={result.jobs} suffix="" />
                <MetricCard label="Spending efficiency" value={result.efficiency} suffix="%" kind="good-high" />
                <MetricCard label="Completion likelihood" value={result.completion} suffix="%" kind="good-high" />
                <MetricCard label="Cost overrun risk" value={result.overrun} suffix="%" kind="good-low" />
              </div>

              <div className="mb-4 flex items-center gap-2.5">
                <div className="text-xs" style={{ color: C.muted }}>
                  Model confidence
                </div>
                <div className="h-1.5 max-w-[200px] flex-1 rounded-full" style={{ background: C.line }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.confidence}%`,
                      background:
                        result.confidence >= 70 ? C.green : result.confidence >= 45 ? C.amber : C.red,
                    }}
                  />
                </div>
                <div className="font-mono text-xs" style={{ color: C.parchment }}>
                  {result.confidence}%
                </div>
              </div>

              <div
                className="mb-4 rounded-xl px-[18px] pt-4 pb-1.5"
                style={{ background: C.bgPanel, border: `1px solid ${C.line}` }}
              >
                <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
                  Draft vs. sector-wide historical average
                </div>
                <div className="h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.line }} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }}
                        labelStyle={{ color: C.parchment }}
                      />
                      <Bar dataKey="Draft" fill={C.gold} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Sector avg" fill="#4A5580" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
                  Matched historical precedents
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {result.matches?.map((match, i) => (
                    <LedgerCard key={match.id} match={match} rank={i + 1} />
                  ))}
                </div>
              </div>

              {result.insights?.length > 0 && (
                <div
                  className="mb-1.5 rounded-[10px] px-4 py-3"
                  style={{ background: 'rgba(217,164,65,0.08)', border: `1px solid ${C.gold}` }}
                >
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                    Insights
                  </div>
                  <ul className="m-0 list-disc pl-[18px] text-[12.5px] leading-relaxed" style={{ color: C.parchment }}>
                    {result.insights.map((text, i) => (
                      <li key={i}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className="mt-[26px] border-t pt-3.5 text-[11px] leading-relaxed"
        style={{ borderColor: C.line, color: C.muted }}
      >
        Demo dataset: {result?.datasetSize ?? '—'} synthetic historical records built from illustrative
        sector/province patterns, for prototype purposes only. A production build replaces this with real records
        from the Ministry of Finance Red Book, Central Bureau of Statistics, and Nepal Rastra Bank. Outputs are an
        evidence-based comparison, not a guaranteed prediction.
      </div>
    </div>
  );
}
