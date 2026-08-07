/**
 * Priority Controller
 * Public citizen priority voting — "district priorities" board.
 * Open endpoints (no login): citizens vote with phone + district,
 * ranking is aggregated with 3/2/1 points per rank.
 */

const PriorityVote = require('../models/PriorityVote');
const { SECTORS } = require('../services/simulationModel');

const VALID_SECTORS = SECTORS.map((s) => s.name);

exports.submitPriorityVote = async (req, res) => {
  try {
    const { phone, district, sectors } = req.body;

    if (!phone || !district || !Array.isArray(sectors) || sectors.length === 0) {
      return res.status(400).json({ success: false, message: 'Phone, district and at least one sector are required' });
    }

    const cleanSectors = [...new Set(sectors.map((s) => String(s).trim()))]
      .slice(0, 3)
      .filter((s) => VALID_SECTORS.includes(s));

    if (cleanSectors.length === 0) {
      return res.status(400).json({ success: false, message: 'Pick at least one valid priority sector' });
    }

    const existing = await PriorityVote.findOneAndUpdate(
      { phone },
      { district: String(district).trim(), sectors: cleanSectors },
      { returnDocument: 'after', upsert: true }
    );

    res.status(201).json({ success: true, message: 'Priority vote saved', vote: existing });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This phone has already voted — updating your choice.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPriorityRanking = async (req, res) => {
  try {
    const { district } = req.query;
    const match = district ? { district: String(district).trim() } : {};

    const votes = await PriorityVote.find(match).lean();
    const POINTS = [3, 2, 1];

    const tally = {};
    votes.forEach((vote) => {
      vote.sectors.forEach((sector, idx) => {
        if (!tally[sector]) tally[sector] = { sector, votes: 0, points: 0, districts: new Set() };
        tally[sector].votes += 1;
        tally[sector].points += POINTS[idx] || 0;
        tally[sector].districts.add(vote.district);
      });
    });

    const overall = Object.values(tally)
      .map((r) => ({ ...r, districts: r.districts.size }))
      .sort((a, b) => b.points - a.points || b.votes - a.votes);

    const totalVotes = votes.length;

    res.json({
      success: true,
      ranking: overall,
      totalVotes,
      districtCount: new Set(votes.map((v) => v.district)).size,
      filterDistrict: district || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
