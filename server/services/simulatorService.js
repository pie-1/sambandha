/**
 * Simulator Service
 * 
 * Placeholder for the actual simulation model
 * replace the mock with actual Python service
 */

const simulatePolicyImpact = async (draftId, sector, district, budgetAmount) => {
  // TODO: Replace this with actual model call
  // Your service: POST http://localhost:8000/predict
  
  try {
    // Mock simulation response for prototype
    const mockData = {
      estimatedJobs: Math.floor(Math.random() * 200) + 50,
      spendingEfficiencyScore: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)),
      comparableCases: [
        {
          year: 2023,
          district: district || 'Kathmandu',
          outcome: 'On-budget, completed on time',
          efficiency: 0.85
        },
        {
          year: 2022,
          district: district || 'Lalitpur',
          outcome: 'Over budget by 15%, delayed 3 months',
          efficiency: 0.62
        },
        {
          year: 2021,
          district: district || 'Bhaktapur',
          outcome: 'Under budget, completed early',
          efficiency: 0.91
        }
      ],
      sector: sector || 'development',
      budgetAmount: budgetAmount || 1000000,
      confidenceScore: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      projectedGrowth: parseFloat((Math.random() * 0.15 + 0.05).toFixed(3)),
      recommendations: [
        'Consider phased implementation for better resource allocation',
        'Engage local stakeholders early in the process',
        'Regular monitoring and evaluation recommended'
      ]
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockData;
  } catch (error) {
    console.error('Simulation error:', error.message);
    throw new Error('Failed to run simulation');
  }
};

// In future: Call actual Python service
const callExternalService = async (data) => {
  try {
    const response = await axios.post('http://localhost:8000/predict', data, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error('External service error:', error.message);
    throw new Error('External simulation service unavailable');
  }
};

module.exports = {
  simulatePolicyImpact,
  callExternalService,
};