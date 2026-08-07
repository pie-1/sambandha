/**
 * Project Controller
 * Public transparency endpoints over the seeded provincial capital
 * project ledger (Project model, populated by `npm run seed:sim`).
 */

const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const { province, sector, status, year } = req.query;
    const filter = {};

    if (province) filter.province = String(province).trim();
    if (sector) filter.sector = String(sector).trim();
    if (status) filter.status = String(status).trim();
    if (year) filter.year = Number(year);

    const projects = await Project.find(filter)
      .sort({ year: -1, budget: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, projects, count: projects.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const [statusAgg, provinceAgg, sectorAgg] = await Promise.all([
      Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, budget: { $sum: '$budget' } } },
        { $sort: { count: -1 } },
      ]),
      Project.aggregate([
        { $group: { _id: '$province', count: { $sum: 1 }, budget: { $sum: '$budget' }, completion: { $avg: '$completion' } } },
        { $sort: { budget: -1 } },
      ]),
      Project.aggregate([
        { $group: { _id: '$sector', count: { $sum: 1 }, budget: { $sum: '$budget' }, completion: { $avg: '$completion' } } },
        { $sort: { budget: -1 } },
      ]),
    ]);

    const totals = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalCapital: { $sum: '$budget' },
          avgCompletion: { $avg: '$completion' },
          avgOverrun: { $avg: '$overrun' },
          totalJobs: { $sum: '$jobs' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: totals[0] || { totalProjects: 0, totalCapital: 0, avgCompletion: 0, avgOverrun: 0, totalJobs: 0 },
      byStatus: statusAgg.map((r) => ({ status: r._id, count: r.count, budget: r.budget })),
      byProvince: provinceAgg.map((r) => ({
        province: r._id,
        count: r.count,
        budget: r.budget,
        completion: Math.round(r.completion * 10) / 10,
      })),
      bySector: sectorAgg.map((r) => ({
        sector: r._id,
        count: r.count,
        budget: r.budget,
        completion: Math.round(r.completion * 10) / 10,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
