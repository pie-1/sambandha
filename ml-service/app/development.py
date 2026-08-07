"""Development projection engine — distance-weighted k-NN regression over
the provincial capital project ledger.

Mirrors the reference implementation in server/services/simulationModel.js
(identical scoring, weights and rounding) so projections computed by the
Python service match the JS engine to the same digits. The ledger is pushed
by the Node app at /train time and cached here.
"""

import math

import numpy as np

from .data import FISCAL_YEARS, PROVINCE_BUDGETS, PROVINCES, SECTORS, SOURCES

MATCH_COUNT = 6
PRESENTED_MATCHES = 4


class DevelopmentEngine:
    def __init__(self):
        self.dataset = []

    @property
    def trained(self):
        return len(self.dataset) > 0

    def set_dataset(self, projects):
        self.dataset = list(projects)

    def _pool(self, sector_name):
        return [d for d in self.dataset if d.get("sector") == sector_name]

    def run(self, province, sector_name, budget):
        pool = self._pool(sector_name)
        if not pool:
            raise RuntimeError(f"No ledger records for sector '{sector_name}'")

        log_b = math.log(budget)
        scored = []
        for d in pool:
            budget_dist = abs(math.log(d["budget"]) - log_b) / 3
            province_penalty = 0.0 if d["province"] == province else 0.35
            scored.append((budget_dist * 0.65 + province_penalty, d))
        scored.sort(key=lambda t: t[0])
        matches = scored[:MATCH_COUNT]

        weights = np.asarray([1.0 / (dist + 0.08) for dist, _ in matches])
        w_sum = weights.sum()

        def wavg(key):
            return float(np.asarray([d[key] for _, d in matches]).dot(weights) / w_sum)

        jobs_per_crore = wavg("jobsPerCrore")
        efficiency = int(math.floor(wavg("efficiency") + 0.5))
        completion = int(math.floor(wavg("completion") + 0.5))
        overrun = int(math.floor(wavg("overrun") + 0.5))
        jobs = int(math.floor(jobs_per_crore * budget + 0.5))

        same_province_sector = sum(1 for _, d in matches if d["province"] == province)
        avg_distance = sum(dist for dist, _ in matches) / len(matches)
        confidence = 100 - avg_distance * 140 + same_province_sector * 6
        confidence = int(max(20, min(96, math.floor(confidence + 0.5))))

        sector_all = self._pool(sector_name)

        def avg_round(key):
            return int(math.floor(sum(d[key] for d in sector_all) / len(sector_all) + 0.5))

        return {
            "jobs": jobs,
            "efficiency": efficiency,
            "completion": completion,
            "overrun": overrun,
            "confidence": confidence,
            "matches": [
                {k: v for k, v in d.items() if k not in ("distance", "budgetAllocated")}
                for _, d in matches[:PRESENTED_MATCHES]
            ],
            "sectorAvg": {
                "efficiency": avg_round("efficiency"),
                "completion": avg_round("completion"),
                "overrun": avg_round("overrun"),
            },
            "sameProvinceSector": same_province_sector,
            "datasetSize": len(self.dataset),
            "sources": SOURCES,
            "provinceBenchmark": {
                "province": province,
                "budget": PROVINCE_BUDGETS[province],
                "year": "2080/81",
                "share": round(budget / PROVINCE_BUDGETS[province], 3),
            },
            "engine": "python",
        }

    def sector_analysis(self, sector_name):
        rows = self._pool(sector_name)
        if not rows:
            raise RuntimeError(f"No ledger records for sector '{sector_name}'")

        by_year = []
        for year in FISCAL_YEARS:
            ys = [r for r in rows if r.get("year") == year]

            def avg_round(key):
                return int(math.floor(sum(r[key] for r in ys) / len(ys) + 0.5)) if ys else 0

            by_year.append({
                "year": year,
                "label": f"{year}/79",
                "efficiency": avg_round("efficiency"),
                "completion": avg_round("completion"),
                "overrun": avg_round("overrun"),
            })

        def trend(key, higher_is_better):
            first = by_year[0][key]
            last = by_year[-1][key]
            delta = round(last - first, 1)
            direction = "stable"
            if delta > 2 if higher_is_better else delta < -2:
                direction = "improving"
            elif delta < -2 if higher_is_better else delta > 2:
                direction = "deteriorating"
            return {"from": first, "to": last, "delta": delta, "direction": direction}

        def count(status):
            return sum(1 for r in rows if r.get("status") == status)

        total_capital = sum(PROVINCE_BUDGETS[p] for p in PROVINCES)

        return {
            "trend": {
                "period": "2078/79–2080/81",
                "byYear": by_year,
                "completion": trend("completion", True),
                "efficiency": trend("efficiency", True),
                "overrun": trend("overrun", False),
            },
            "aggregates": {
                "statusBreakdown": [
                    {"name": "Completed", "value": count("Completed")},
                    {"name": "Ongoing", "value": count("Ongoing")},
                    {"name": "Delayed", "value": count("Delayed")},
                ],
                "sectorShare": [
                    {"name": s["name"], "icon": s["icon"], "value": int(math.floor(total_capital * s["share"] + 0.5))}
                    for s in SECTORS
                ],
                "provinceShare": [{"name": p, "value": PROVINCE_BUDGETS[p]} for p in PROVINCES],
                "totalCapital": total_capital,
            },
            "engine": "python",
        }


engine = DevelopmentEngine()
