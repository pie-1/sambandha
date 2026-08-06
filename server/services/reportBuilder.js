/**
 * Report builder — turns model outputs into a plain-language narrative
 * summary that leads the simulation report.
 */

function buildSummary({ scenario, projections, historical, live, health }) {
  const { province, sectorName, budget } = scenario;
  const t = historical.trend;
  const avg = projections.sectorAvg;
  const sentences = [];

  sentences.push(
    `This ${budget} crore ${sectorName.toLowerCase()} allocation for ${province} is benchmarked against ${historical.datasetSize} provincial capital projects recorded between ${historical.period}.`
  );

  const trendBits = [];
  if (t.completion.direction === 'improving') trendBits.push(`completion has improved from ${t.completion.from}% to ${t.completion.to}%`);
  else if (t.completion.direction === 'deteriorating') trendBits.push(`completion has slipped from ${t.completion.from}% to ${t.completion.to}%`);
  if (t.overrun.direction === 'improving') trendBits.push(`cost overruns have fallen from ${t.overrun.from}% to ${t.overrun.to}%`);
  else if (t.overrun.direction === 'deteriorating') trendBits.push(`cost overruns have climbed from ${t.overrun.from}% to ${t.overrun.to}%`);

  if (trendBits.length > 0) {
    sentences.push(`Across this sector nationally over the period, ${trendBits.join(' while ')}.`);
  } else {
    sentences.push(
      `Sector execution has been broadly stable over the period, with completion around ${t.completion.to}% and overruns near ${t.overrun.to}%.`
    );
  }

  sentences.push(
    `The model projects ${projections.completion}% completion likelihood (sector average ${avg.completion}%), ${projections.efficiency}% spending efficiency (${avg.efficiency}% average) and ${projections.overrun}% overrun risk (${avg.overrun}% average), supporting an estimated ${projections.jobs.toLocaleString('en-IN')} local jobs at this budget.`
  );

  if (health) {
    const best = health.impactModel.best;
    const gainTxt = `${best.gain > 0 ? '+' : ''}${best.gain}`;
    sentences.push(
      `The health model puts success probability at ${Math.round(health.successModel.probability * 100)}%, with the strongest projected coverage movement in ${best.program} (${gainTxt} points) and expected annual claims of Rs ${health.claimsModel.forecast.toLocaleString('en-IN')} for the given claimant profile.`
    );
  }

  if (live) {
    if (live.feedback.total > 0) {
      sentences.push(
        `Public consensus on this draft is ${live.consensus.label.toLowerCase()} — ${live.feedback.approvalRate}% approval from ${live.feedback.total} citizen votes.`
      );
    } else {
      sentences.push('No public votes have been recorded on this draft yet, so community sentiment is currently not available.');
    }
    if (live.comments.total > 0) {
      sentences.push(
        `Experts and officers contributed ${live.comments.total} comments (${live.comments.experts} from verified experts), with the discussion reading ${live.comments.sentiment.label.toLowerCase()}.`
      );
    }
  }

  return sentences.join(' ');
}

module.exports = {
  buildSummary,
};
