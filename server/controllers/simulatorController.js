/**
 * Simulator Controller
 * Placeholder for impact simulation
 * will replaced this with actual model
 */

exports.simulate = async (req, res) => {
  try {
    const { draftId, sector, district, budgetAmount } = req.body;

    // TODO: Replace this mock with actual model call
    // Your friend's service: POST http://localhost:8000/predict
    
    // Mock response for prototype
    const mockResults = {
      estimatedJobs: Math.floor(Math.random() * 200) + 50,
      spendingEfficiencyScore: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)),
      comparableCases: [
        { 
          year: 2023, 
          district: district || 'Kathmandu', 
          outcome: 'On-budget, completed on time' 
        },
        { 
          year: 2022, 
          district: district || 'Lalitpur', 
          outcome: 'Over budget by 15%, delayed 3 months' 
        },
        { 
          year: 2021, 
          district: district || 'Bhaktapur', 
          outcome: 'Under budget, completed early' 
        }
      ],
      sector: sector || 'development',
      budgetAmount: budgetAmount || 1000000,
      confidence: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    };

    res.json({
      success: true,
      message: 'Simulation complete (mock data - replace with actual model)',
      data: mockResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};