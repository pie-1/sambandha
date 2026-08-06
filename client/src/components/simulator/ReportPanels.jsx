/**
 * Report panels for the unified simulation report.
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SIM_COLORS as C, scoreColor } from '../../lib/simulation/constants';
import { MetricCard, Stat, SectionTitle, Panel } from './common';

function SectionHeader({ number, title, sub }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.gold }}>
        {number}
      </span>
      <h2 className="text-[15px] font-semibold" style={{ color: C.parchment }}>
        {title}
      </h2>
      {sub && (
        <span className="hidden text-[11.5px] sm:inline" style={{ color: C.muted }}>
          — {sub}
        </span>
      )}
    </div>
  );
}

export function SummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <div
      className="mb-5 rounded-xl px-5 py-4"
      style={{ background: 'rgba(217,164,65,0.07)', border: `1px solid ${C.gold}` }}
    >
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider" style={{ color: C.gold }}>
        Report summary
      </div>
      <p className="text-[13.5px] leading-relaxed" style={{ color: C.parchment }}>
        {summary}
      </p>
    </div>
  );
}

export function ProjectionMetrics({ projections }) {
  return (
    <Panel className="mb-5">
      <SectionHeader number="01" title="Projected outcomes" sub="vs. sector-wide historical average" />
      <div className="mb-3 flex flex-wrap gap-3">
        <MetricCard label="Estimated local jobs" value={projections.jobs.toLocaleString('en-IN')} suffix="" />
        <MetricCard label="Spending efficiency" value={projections.efficiency} suffix="%" kind="good-high" />
        <MetricCard label="Completion likelihood" value={projections.completion} suffix="%" kind="good-high" />
        <MetricCard label="Cost overrun risk" value={projections.overrun} suffix="%" kind="good-low" />
      </div>
      <div className="flex items-center gap-2.5">
        <div className="text-xs" style={{ color: C.muted }}>Model confidence</div>
        <div className="h-1.5 max-w-[200px] flex-1 rounded-full" style={{ background: C.line }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${projections.confidence}%`,
              background:
                projections.confidence >= 70 ? C.green : projections.confidence >= 45 ? C.amber : C.red,
            }}
          />
        </div>
        <div className="font-mono text-xs" style={{ color: C.parchment }}>
          {projections.confidence}%
        </div>
        <div className="ml-2 text-[11.5px]" style={{ color: C.muted }}>
          {projections.sameProvinceSector > 0
            ? `${projections.sameProvinceSector} matched precedent${projections.sameProvinceSector > 1 ? 's' : ''} in this province`
            : 'leans on records from other provinces'}
        </div>
      </div>
    </Panel>
  );
}

function TrendChip({ label, trend }) {
  const improving = trend.direction === 'improving';
  const deteriorating = trend.direction === 'deteriorating';
  const color = improving ? C.green : deteriorating ? C.red : C.muted;
  const arrow = improving ? '↑' : deteriorating ? '↓' : '→';
  return (
    <div
      className="flex-1 min-w-[130px] rounded-[10px] px-4 py-3"
      style={{ background: C.bgCard, border: `1px solid ${C.line}` }}
    >
      <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>
        {label}
      </div>
      <div className="font-mono text-[15px] font-semibold" style={{ color }}>
        {arrow} {trend.from}% → {trend.to}%
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: C.muted }}>
        {trend.direction === 'stable' ? 'stable over the period' : `${trend.direction} since FY 2078/79`}
      </div>
    </div>
  );
}

export function HistoricalPanel({ historical, projections }) {
  const chartData = [
    { name: 'Efficiency', Draft: projections.efficiency, 'Sector avg': historical.sectorAvg.efficiency },
    { name: 'Completion', Draft: projections.completion, 'Sector avg': historical.sectorAvg.completion },
    { name: 'Overrun risk', Draft: projections.overrun, 'Sector avg': historical.sectorAvg.overrun },
  ];
  const t = historical.trend;

  return (
    <Panel className="mb-5">
      <SectionHeader number="02" title="Historical context" sub={`${historical.datasetSize} provincial projects · FY ${historical.period}`} />

      <div className="mb-4 flex flex-wrap gap-2.5">
        <TrendChip label="Completion" trend={t.completion} />
        <TrendChip label="Spending efficiency" trend={t.efficiency} />
        <TrendChip label="Cost overrun" trend={t.overrun} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
            Draft vs. sector average
          </div>
          <div className="h-[170px]">
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
        <div>
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
            Sector execution trend by fiscal year
          </div>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={t.byYear} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: C.parchment }}
                />
                <Line type="monotone" dataKey="completion" name="Completion %" stroke={C.gold} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="overrun" name="Overrun %" stroke={C.red} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
        Province benchmark: this allocation is{' '}
        <span className="font-mono" style={{ color: C.parchment }}>
          {Math.round(historical.provinceBenchmark.share * 100)}%
        </span>{' '}
        of {historical.provinceBenchmark.province ?? ''} total capital budget in FY{' '}
        {historical.provinceBenchmark.year} (Rs {historical.provinceBenchmark.budget.toLocaleString('en-IN')} crore).
      </div>
    </Panel>
  );
}

export function ConsensusPanel({ live }) {
  const f = live.feedback;
  const c = live.comments;
  const approval = f.approvalRate ?? 0;
  const barColor = approval >= 55 ? C.green : approval >= 45 ? C.amber : C.red;

  return (
    <Panel className="mb-5">
      <SectionHeader
        number="03"
        title="Community consensus"
        sub={`live participation data from this draft`}
      />

      {f.total === 0 && c.total === 0 && (
        <div className="rounded-[10px] px-4 py-3 text-[12.5px]" style={{ background: C.bgCard, border: `1px dashed ${C.line}`, color: C.muted }}>
          This draft has not received public votes or expert comments yet — consensus will appear here as citizens and experts participate.
        </div>
      )}

      {f.total > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex flex-wrap items-baseline gap-3">
            <span className="text-lg font-semibold" style={{ color: barColor }}>
              {live.consensus.label}
            </span>
            <span className="font-mono text-[13px]" style={{ color: C.parchment }}>
              {f.approvalRate}% approve
            </span>
            <span className="text-[11.5px]" style={{ color: C.muted }}>
              {f.total} votes · {f.approve} approve · {f.disapprove} disapprove
            </span>
          </div>
          <div className="h-2 max-w-[420px] overflow-hidden rounded-full" style={{ background: C.line }}>
            <div className="h-full rounded-full" style={{ width: `${approval}%`, background: barColor }} />
          </div>
          {Object.keys(f.districts).length > 0 && (
            <div className="mt-2 text-[11.5px]" style={{ color: C.muted }}>
              Top districts: {Object.entries(f.districts)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 3)
                .map(([d, v]) => `${d} (${v.approve}/${v.total} approve)`)
                .join(' · ')}
            </div>
          )}
        </div>
      )}

      {c.total > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-[10px] px-4 py-3" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
            <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Reviewer discussion</div>
            <div className="font-mono text-[15px] font-semibold" style={{ color: C.parchment }}>
              {c.total} comments
            </div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: C.muted }}>
              {c.experts} from verified experts · {c.officers} from officers
            </div>
          </div>
          <div className="rounded-[10px] px-4 py-3" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
            <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Sentiment</div>
            <div className="font-mono text-[15px] font-semibold" style={{ color: c.sentiment.label.includes('Critical') ? C.red : c.sentiment.label.includes('Supportive') ? C.green : C.gold }}>
              {c.sentiment.label}
            </div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: C.muted }}>
              {c.sentiment.positive} supportive · {c.sentiment.negative} critical
            </div>
          </div>
          <div className="rounded-[10px] px-4 py-3" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
            <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Draft activity</div>
            <div className="font-mono text-[15px] font-semibold" style={{ color: C.parchment }}>
              {live.draft.versionCount} version{live.draft.versionCount === 1 ? '' : 's'}
            </div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: C.muted }}>
              {live.draft.status.replace('_', ' ')} · {live.draft.district}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

export function StandaloneConsensusHint({ show }) {
  if (!show) return null;
  return (
    <Panel className="mb-5">
      <SectionHeader number="03" title="Community consensus" sub="requires a linked draft" />
      <div className="text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
        Run this simulation from a draft&apos;s page to fold in live participation — expert comments, sentiment
        and public approval votes — into the report. Standalone runs compare against the historical ledger only.
      </div>    </Panel>
  );
}

function DriverBar({ label, impact, direction }) {
  return (
    <div className="mb-1.5 flex items-center gap-2.5 text-[12px]">
      <span className="w-[210px] shrink-0 truncate" style={{ color: C.muted }}>{label}</span>
      <div className="h-1.5 flex-1 rounded-full" style={{ background: C.line }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.abs(impact) * 40)}%`,
            background: direction === 'positive' ? C.green : C.red,
            marginLeft: direction === 'positive' ? '50%' : undefined,
            marginRight: direction === 'positive' ? undefined : '50%',
            float: direction === 'positive' ? 'right' : 'left',
          }}
        />
      </div>
      <span className="w-[130px] text-right font-mono text-[11px]" style={{ color: direction === 'positive' ? C.green : C.red }}>
        {impact} ({direction})
      </span>
    </div>
  );
}

export function HealthReport({ health }) {
  const p = health.successModel.probability;
  const successColor = p >= 0.7 ? C.green : p >= 0.45 ? C.gold : C.red;
  const maxGain = Math.max(...health.impactModel.programs.map((x) => Math.abs(x.gain)), 1);

  return (
    <Panel className="mb-5">
      <SectionHeader number="04" title="Health systems analysis" sub={`${health.tagging.program} · ${health.tagging.province}`} />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[10px] px-[18px] py-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
          <div className="mb-2 text-xs uppercase tracking-wider text-[#9BA0B8]">Success probability</div>
          <div className="font-mono text-[34px] font-semibold" style={{ color: successColor }}>
            {Math.round(p * 100)}%
          </div>
          <div className="mt-1.5">
            <div className="h-1.5 rounded-full" style={{ background: C.line }}>
              <div className="h-full rounded-full" style={{ width: `${p * 100}%`, background: successColor }} />
            </div>
          </div>
          <div className="mt-1.5 text-[11px]" style={{ color: C.muted }}>
            {health.successModel.prediction} likelihood (baseline {Math.round(health.successModel.baseRate * 100)}%)
          </div>
        </div>
        <Stat label="Holdout accuracy" value={`${Math.round(health.successModel.holdout.accuracy * 100)}%`} sub={`AUC ${health.successModel.holdout.auc.toFixed(2)} · ${health.successModel.sampleSize} records`} color={C.gold} />
        <Stat label="Marginal gain / crore" value={health.impactModel.model.marginalPerCrore} sub={`coverage points · model R² ${health.impactModel.model.r2}`} color={C.parchment} />
      </div>

      <div className="mb-4">
        <SectionTitle>Model drivers — standardized coefficients</SectionTitle>
        {health.successModel.drivers.map((d) => (
          <DriverBar key={d.key} label={d.label} impact={d.impact} direction={d.direction} />
        ))}
      </div>

      <div className="mb-4">
        <SectionTitle>Projected coverage gain at {health.inputs.budget} crore</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {health.impactModel.programs.map((x) => {
            const isBest = x.program === health.impactModel.best.program;
            return (
              <div key={x.program} className="flex items-center gap-2.5 text-[12px]">
                <span className="w-[170px] shrink-0 truncate" style={{ color: isBest ? C.gold : C.parchment }}>{x.program}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-[#0E1324]">
                  <div
                    className="flex h-full items-center justify-end px-1 font-mono text-[10px]"
                    style={{ width: `${Math.max(6, (Math.abs(x.gain) / maxGain) * 100)}%`, background: isBest ? C.gold : '#4A5580', color: isBest ? '#12172B' : C.parchment }}
                  >
                    {x.gain > 0 ? `+${x.gain}` : x.gain}
                  </div>
                </div>
                <span className="w-[90px] text-right font-mono text-[11px]" style={{ color: C.muted }}>
                  {x.currentCoverage} → {x.projectedCoverage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <SectionTitle>Expected annual claim for the given profile</SectionTitle>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-[26px] font-semibold" style={{ color: successColor }}>
            Rs {health.claimsModel.forecast.toLocaleString('en-IN')}
          </span>
          <span className="rounded border px-2 py-0.5 font-mono text-[11px]" style={{ color: successColor, borderColor: successColor }}>
            {health.claimsModel.risk}
          </span>
          <span className="text-[11.5px]" style={{ color: C.muted }}>
            model R² {health.claimsModel.model.r2} · baseline Rs {health.claimsModel.baseline.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {health.consensus.length > 0 && (
        <div>
          <SectionTitle>Expert consensus</SectionTitle>
          <div className="flex flex-col gap-2">
            {health.consensus.map((item, i) => (
              <div
                key={i}
                className="rounded-[10px] border-l-[3px] px-4 py-3 text-[12.5px] leading-relaxed"
                style={{
                  borderColor: item.level === 'positive' ? C.green : item.level === 'negative' ? C.red : C.gold,
                  background: C.bgCard,
                }}
              >
                <span className="mr-2 font-mono text-[11px] uppercase" style={{ color: item.level === 'positive' ? C.green : item.level === 'negative' ? C.red : C.gold }}>
                  [{item.level}]
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

function LedgerCard({ match, rank }) {
  const statusColor = match.status === 'Delayed' ? C.red : match.status === 'Ongoing' ? C.amber : C.green;
  return (
    <div
      className="relative overflow-hidden rounded-lg px-3.5 py-3"
      style={{ background: C.bgCard, border: `1px solid ${C.line}` }}
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
        <div className="flex items-center gap-2">
          <span className="rounded border px-1.5 py-px font-mono text-[10px]" style={{ color: statusColor, borderColor: statusColor }}>
            {match.status}
          </span>
          <span className="rounded border px-1.5 py-px font-mono text-[10px]" style={{ color: C.gold, borderColor: C.gold }}>
            #{rank}
          </span>
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

export function MatchesGrid({ matches }) {
  return (
    <Panel className="mb-5">
      <SectionHeader number="05" title="Matched historical precedents" sub="nearest neighbours in the project ledger" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {matches.map((match, i) => (
          <LedgerCard key={match.id} match={match} rank={i + 1} />
        ))}
      </div>
    </Panel>
  );
}

function InsightGroup({ title, items, color, icon }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-[10px] px-4 py-3" style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderLeft: `3px solid ${color}` }}>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color }}>
        {icon} {title}
      </div>
      <ul className="m-0 list-disc pl-[18px] text-[12.5px] leading-relaxed" style={{ color: C.parchment }}>
        {items.map((text, i) => (
          <li key={i} className="mb-1 last:mb-0">{text}</li>
        ))}
      </ul>
    </div>
  );
}

export function InsightsPanel({ insights }) {
  return (
    <Panel className="mb-5">
      <SectionHeader number="06" title="Detailed insights" sub="strengths, risks and recommendations" />
      <div className="grid gap-2.5 lg:grid-cols-3">
        <InsightGroup title="Strengths" items={insights.strengths} color={C.green} icon="✓" />
        <InsightGroup title="Risks" items={insights.risks} color={C.red} icon="⚠" />
        <InsightGroup title="Recommendations" items={insights.recommendations} color={C.gold} icon="→" />
      </div>
    </Panel>
  );
}
