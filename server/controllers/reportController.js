/**
 * Report Controller - One Health problem reporting
 */

const Report = require("../models/Report");
const Draft = require("../models/Draft");

// Create a report with images
exports.createReport = async (req, res) => {
  try {
    const { images, ...reportData } = req.body;
    
    const report = new Report({
      ...reportData,
      reporterId: req.user.id,
      reporterPhone: req.user.phone,
      images: images || [] // Accept image URLs from frontend
    });
    
    await report.save();
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports by district
exports.getReportsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const reports = await Report.find({ district })
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get report statistics
exports.getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
          critical: {
            $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] }
          },
          maternal_health: {
            $sum: { $cond: [{ $eq: ['$category', 'maternal_health'] }, 1, 0] }
          },
          child_nutrition: {
            $sum: { $cond: [{ $eq: ['$category', 'child_nutrition'] }, 1, 0] }
          },
          water_quality: {
            $sum: { $cond: [{ $eq: ['$category', 'water_quality'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports by category
exports.getReportsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const reports = await Report.find({ category })
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reports with filters
exports.getAllReports = async (req, res) => {
  try {
    const { district, category, urgency, status } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top problem districts
exports.getTopProblemDistricts = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
          healthIssues: {
            $sum: { $cond: [{ $in: ['$category', ['maternal_health', 'child_nutrition', 'disease_prevention']] }, 1, 0] }
          },
          environmentIssues: {
            $sum: { $cond: [{ $in: ['$category', ['water_quality', 'air_quality', 'climate_health']] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, districts: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get One Health summary
exports.getOneHealthSummary = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const healthReports = await Report.countDocuments({
      category: { $in: ['maternal_health', 'child_nutrition', 'disease_prevention', 'healthcare_access'] }
    });
    const environmentReports = await Report.countDocuments({
      category: { $in: ['water_quality', 'air_quality', 'climate_health'] }
    });
    const criticalReports = await Report.countDocuments({ urgency: 'critical' });

    res.json({
      success: true,
      summary: {
        totalReports,
        healthReports,
        environmentReports,
        oneHealthReports: healthReports + environmentReports,
        criticalReports,
        districtsAffected: await Report.distinct('district').then(d => d.length)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get report with images
exports.getReportWithImages = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id)
      .populate('reporterId', 'name phone');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  this controller is designed to manage the complete workflow of 
// citizen reports - from creating and retrieving reports to filtering data , generating district/category statistics
// and providing one health dashboards and summaries