/**
 * Live draft insights — aggregates the platform's own participation data
 * (expert comments, public feedback) into a community-consensus signal
 * that feeds the simulation report.
 */

const Comment = require('../models/Comment');
const Feedback = require('../models/Feedback');

const POSITIVE_WORDS = [
  'support', 'supports', 'supportive', 'agree', 'agrees', 'recommend', 'recommends',
  'excellent', 'strong', 'benefit', 'beneficial', 'improve', 'improves', 'improvement',
  'appreciate', 'good', 'effective', 'welcome', 'endorse', 'valuable', 'timely',
  'promising', 'well designed', 'well-designed', 'clear', 'needed', 'important',
  'समर्थन', 'सहमत', 'प्रभावकारी', 'राम्रो', 'महत्वपूर्ण',
];

const NEGATIVE_WORDS = [
  'concern', 'concerns', 'concerned', 'risk', 'risks', 'oppose', 'disagree',
  'issue', 'issues', 'problem', 'problems', 'fail', 'fails', 'reject', 'worried',
  'against', 'unsustainable', 'delay', 'delays', 'costly', 'gap', 'lacking',
  'unclear', 'missing', 'weak', 'difficult', 'expensive', 'exclude', 'excludes',
  'bad', 'badly', 'terrible', 'awful', 'horrible', 'worst', 'waste', 'wasteful',
  'useless', 'pointless', 'unacceptable', 'disaster', 'hate', 'dislike',
  'not good', 'no good', 'ineffective', 'wrong',
  'चिन्ता', 'असहमत', 'जोखिम', 'समस्या', 'कठिन', 'खराब',
];

function analyzeSentiment(text) {
  const haystack = (text || '').toLowerCase();
  const positive = POSITIVE_WORDS.filter((w) => haystack.includes(w)).length;
  const negative = NEGATIVE_WORDS.filter((w) => haystack.includes(w)).length;
  const score = positive - negative;

  let label = 'Neutral';
  if (score >= 2) label = 'Supportive';
  else if (score >= 1) label = 'Leaning supportive';
  else if (score <= -2) label = 'Critical';
  else if (score <= -1) label = 'Leaning critical';

  return { score, positive, negative, label };
}

function consensusLevel(approvalRate, total) {
  if (total === 0) return null;
  const rate = approvalRate / 100;
  if (rate >= 0.7) return 'Strong public support';
  if (rate >= 0.55) return 'Majority support';
  if (rate > 0.45) return 'Divided';
  if (rate >= 0.3) return 'Majority opposition';
  return 'Strong opposition';
}

/**
 * Collect community participation data for a draft.
 * Returns null when no draft is linked.
 */
async function collectDraftInsights(draft) {
  if (!draft) return null;

  const [comments, feedbacks] = await Promise.all([
    Comment.find({ draftId: draft._id, isDeleted: false }).lean(),
    Feedback.find({ draftId: draft._id }).lean(),
  ]);

  const commentSentiment = comments.map((c) => ({
    role: c.authorRole,
    text: c.text,
    ...analyzeSentiment(c.text),
  }));

  const totalScore = commentSentiment.reduce((s, c) => s + c.score, 0);
  const positiveCount = commentSentiment.filter((c) => c.score > 0).length;
  const negativeCount = commentSentiment.filter((c) => c.score < 0).length;

  const sentimentLabel =
    negativeCount === 0 && positiveCount === 0
      ? 'Neutral'
      : negativeCount > positiveCount
        ? 'Critical'
        : positiveCount > negativeCount
          ? 'Supportive'
          : 'Mixed sentiment';

  const approve = feedbacks.filter((f) => f.reaction === 'approve').length;
  const disapprove = feedbacks.length - approve;
  const approvalRate = feedbacks.length
    ? Math.round((approve / feedbacks.length) * 100)
    : null;

  const districtBreakdown = {};
  feedbacks.forEach((f) => {
    if (!f.district) return;
    districtBreakdown[f.district] = districtBreakdown[f.district] || { approve: 0, disapprove: 0, total: 0 };
    districtBreakdown[f.district][f.reaction]++;
    districtBreakdown[f.district].total++;
  });

  return {
    draft: {
      status: draft.status,
      sector: draft.sector,
      district: draft.district,
      versionCount: (draft.versions || []).length,
    },
    comments: {
      total: comments.length,
      experts: comments.filter((c) => c.authorRole === 'expert').length,
      officers: comments.filter((c) => c.authorRole === 'officer').length,
      sentiment: {
        label: sentimentLabel,
        score: totalScore,
        positive: positiveCount,
        negative: negativeCount,
      },
    },
    feedback: {
      total: feedbacks.length,
      approve,
      disapprove,
      approvalRate,
      districts: districtBreakdown,
    },
    consensus: {
      label: consensusLevel(approvalRate, feedbacks.length),
      approvalRate,
      votes: feedbacks.length,
      commentCount: comments.length,
      sentiment: sentimentLabel,
    },
  };
}

module.exports = {
  collectDraftInsights,
  analyzeSentiment,
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
};
