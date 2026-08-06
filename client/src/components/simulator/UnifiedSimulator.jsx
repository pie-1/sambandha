/**
 * Unified Policy Simulator
 * One engine, one page. Sector selection drives the analysis:
 * development sectors run the ledger benchmark; Health & Nutrition also
 * runs the trained health ML models. Draft-linked runs fold in live
 * community consensus from comments and public feedback.
 */

import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import API from '../../api/endpoints';
import toast from 'react-hot-toast';
import { PROVINCES, SECTORS, SIM_COLORS as C, clamp } from '../../lib/simulation/constants';
import { Panel, StateCard, SourcesFooter } from './common';
import {
  SummaryCard,
  ProjectionMetrics,
  HistoricalPanel,
  ConsensusPanel,
  StandaloneConsensusHint,
  HealthReport,
  MatchesGrid,
  InsightsPanel,
} from './ReportPanels';

export const HEALTH_SECTOR_NAME = 'Health & Nutrition';

const PROGRAMS = [
  'Immunization',
  'Maternal & Neonatal',
  'Nutrition',
  'Water & Sanitation',
  'Primary Care',
  'Emergency Services',
  'Mental Health',
  'NCD / Diabetes',
];

const INCOME_BANDS = [
  { value: 1, label: 'Low (<Rs 1.5L/yr)' },
  { value: 2, label: 'Middle (1.5–5L/yr)' },
  { value: 3, label: 'Upper-middle (5–15L/yr)' },
  { value: 4, label: 'High (>15L/yr)' },
];

function FieldLabel({ children }) {
  return (
    <div className="mb-2.5 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
      {children}
    </div>
  );
}

export default function UnifiedSimulator({
  draftId = null,
  draftTitle = null,
  initialProvince = 'Bagmati',
  initialSectorIdx = 0,
  initialBudget = 5,
  preferHealth = false,
  onBack,
}) {
  const healthSectorIdx = SECTORS.findIndex((s) => s.name === HEALTH_SECTOR_NAME);
  const [province, setProvince] = useState(initialProvince);
  const [sectorIdx, setSectorIdx] = useState(
    preferHealth && healthSectorIdx >= 0 ? healthSectorIdx : initialSectorIdx
  );
  const [budget, setBudget] = useState(initialBudget);
  const [program, setProgram] = useState('Immunization');
  const [showClaimant, setShowClaimant] = useState(false);
  const [age, setAge] = useState(38);
  const [familySize, setFamilySize] = useState(4);
  const [incomeBand, setIncomeBand] = useState(2);
  const [healthIndex, setHealthIndex] = useState(70);
  const [preExisting, setPreExisting] = useState(false);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const sector = SECTORS[sectorIdx];
  const isHealth = sector.name === HEALTH_SECTOR_NAME;

  const resetResult = () => setResult(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    const payload = {
      draftId,
      province,
      sectorName: sector.name,
      budget,
    };
    if (isHealth) {
      payload.program = program;
      payload.claimant = { age, familySize, incomeBand, healthIndex, preExisting };
    }
    try {
      const { data } = await axiosClient.post(API.SIMULATOR, payload);
      setResult(data.data);
    } catch {
      toast.error('Simulation failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-full font-sans" style={{ background: C.bg, color: C.parchment }}>
      {onBack && (
        <button type="button" onClick={onBack} className="mb-4 text-sm transition hover:opacity-80" style={{ color: C.gold }}>
          ← Back
        </button>
      )}

      <div className="mb-1.5 flex items-center gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: C.gold }}>
            Sambandh · सम्बन्ध
          </div>
          <h1 className="simulator-title mt-0.5 text-[26px] font-semibold">Policy Simulation Lab</h1>
          {draftTitle && (
            <p className="mt-1 text-sm" style={{ color: C.muted }}>
              Draft: {draftTitle}
            </p>
          )}
        </div>
      </div>

      <p className="mt-2 max-w-[680px] text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
        {draftId
          ? `Evaluates this draft's ${sector.name} allocation against historical provincial capital projects${isHealth ? ', runs the trained health ML models' : ''}, and folds in the community's own comments and votes.`
          : 'Benchmarks a budget against historical provincial capital projects. Health &amp; Nutrition also runs the trained health ML models. Link a draft to fold in live community consensus.'}
      </p>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[320px_1fr]">
        {/* Inputs */}
        <Panel>
          <FieldLabel>Province</FieldLabel>
          <div className="mb-[18px] grid grid-cols-2 gap-1.5">
            {PROVINCES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setProvince(p);
                  resetResult();
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

          <FieldLabel>Sector</FieldLabel>
          {draftId ? (
            <div
              className="mb-[18px] flex items-center justify-between rounded-md px-2.5 py-2"
              style={{ border: `1px solid ${C.gold}`, background: 'rgba(217,164,65,0.14)' }}
            >
              <span className="text-[12.5px]" style={{ color: C.gold }}>
                {sector.icon} {sector.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>
                from draft
              </span>
            </div>
          ) : (
            <div className="mb-[18px] flex flex-col gap-1">
              {SECTORS.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setSectorIdx(i);
                    setBudget(clamp(budget, s.min, s.max));
                    resetResult();
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
          )}

          <FieldLabel>Budget — NPR crore</FieldLabel>
          <div className="mb-1 flex items-center gap-2.5">
            <input
              type="range"
              min={sector.min}
              max={sector.max}
              step={0.1}
              value={budget}
              onChange={(e) => {
                setBudget(parseFloat(e.target.value));
                resetResult();
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
                resetResult();
              }}
              className="simulator-number w-16 rounded-md px-2 py-1.5 font-mono"
            />
          </div>
          <div className="mb-4 text-[11px]" style={{ color: C.muted }}>
            Typical range for this sector: {sector.min}–{sector.max} crore
          </div>

          {isHealth && (
            <div
              className="mb-4 rounded-lg px-3.5 py-3"
              style={{ background: 'rgba(76,154,106,0.08)', border: `1px solid rgba(76,154,106,0.45)` }}
            >
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.green }}>
                Health program
              </div>
              <select
                value={program}
                onChange={(e) => {
                  setProgram(e.target.value);
                  resetResult();
                }}
                className="w-full rounded-md px-2.5 py-2 text-[12.5px]"
                style={{ background: C.bgCard, color: C.parchment, border: `1px solid ${C.line}` }}
              >
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowClaimant((v) => !v)}
                className="mt-3 w-full rounded-md border px-2.5 py-1.5 text-[11.5px] transition"
                style={{ borderColor: C.line, color: showClaimant ? C.gold : C.muted }}
              >
                {showClaimant ? '− Hide claimant profile' : '+ Claimant profile (claims forecast)'}
              </button>

              {showClaimant && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-[11px]" style={{ color: C.muted }}>
                    Age
                    <input
                      type="number"
                      value={age}
                      min={18}
                      max={80}
                      onChange={(e) => {
                        setAge(clamp(parseInt(e.target.value) || 18, 18, 80));
                        resetResult();
                      }}
                      className="simulator-number mt-1 w-full rounded-md px-2 py-1.5 font-mono"
                    />
                  </label>
                  <label className="text-[11px]" style={{ color: C.muted }}>
                    Household size
                    <input
                      type="number"
                      value={familySize}
                      min={1}
                      max={10}
                      onChange={(e) => {
                        setFamilySize(clamp(parseInt(e.target.value) || 1, 1, 10));
                        resetResult();
                      }}
                      className="simulator-number mt-1 w-full rounded-md px-2 py-1.5 font-mono"
                    />
                  </label>
                  <label className="col-span-2 text-[11px]" style={{ color: C.muted }}>
                    Income band
                    <select
                      value={incomeBand}
                      onChange={(e) => {
                        setIncomeBand(parseInt(e.target.value));
                        resetResult();
                      }}
                      className="mt-1 w-full rounded-md px-2 py-1.5 text-[12px]"
                      style={{ background: C.bgCard, color: C.parchment, border: `1px solid ${C.line}` }}
                    >
                      {INCOME_BANDS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 text-[11px]" style={{ color: C.muted }}>
                    Health index (0–100)
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={healthIndex}
                      onChange={(e) => {
                        setHealthIndex(parseInt(e.target.value));
                        resetResult();
                      }}
                      className="simulator-range mt-1.5 w-full"
                    />
                    <div className="mt-0.5 text-right font-mono text-[11px]" style={{ color: C.parchment }}>
                      {healthIndex}
                    </div>
                  </label>
                  <label className="col-span-2 flex items-center gap-2 text-[12px]" style={{ color: C.parchment }}>
                    <input
                      type="checkbox"
                      checked={preExisting}
                      onChange={(e) => {
                        setPreExisting(e.target.checked);
                        resetResult();
                      }}
                      className="h-4 w-4"
                    />
                    Pre-existing condition
                  </label>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={run}
            disabled={running}
            className="w-full rounded-lg py-2.5 text-sm font-semibold tracking-wide text-white transition disabled:cursor-default"
            style={{ background: running ? C.crimsonDeep : C.crimson }}
          >
            {running
              ? isHealth
                ? 'Training & analysing…'
                : 'Comparing to precedent…'
              : result
                ? 'Re-run simulation'
                : 'Run simulation'}
          </button>
        </Panel>

        {/* Report */}
        <div>
          {!result && !running && (
            <StateCard
              emptyText="Set a province, sector and budget, then run the simulation to receive a full report: projections, historical trend, community consensus and detailed insights."
            />
          )}

          {running && (
            <StateCard
              running
              runningText={isHealth ? 'Normalizing features → gradient descent → predicting…' : 'Matching budget against historical ledger…'}
            />
          )}

          {result && !running && (
            <>
              <SummaryCard summary={result.summary} />
              <ProjectionMetrics projections={result.projections} />
              <HistoricalPanel historical={result.historical} projections={result.projections} />
              {result.live ? (
                <ConsensusPanel live={result.live} />
              ) : (
                <StandaloneConsensusHint show={!draftId} />
              )}
              {result.health && <HealthReport health={result.health} />}
              <MatchesGrid matches={result.projections.matches} />
              <InsightsPanel insights={result.insights} />
            </>
          )}
        </div>
      </div>

      <SourcesFooter
        sources={result?.sources}
        datasetSize={result?.historical.datasetSize}
        note="Outputs are evidence-based estimates calibrated to published budget and survey data and this platform's own participation records — they inform planning but do not guarantee outcomes."
      />
    </div>
  );
}
