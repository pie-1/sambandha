/**
 * Application Constants
 */

// User Roles
const ROLES = {
  OFFICER: 'officer',
  EXPERT: 'expert',
  CITIZEN: 'citizen',
};

// Draft Status
const DRAFT_STATUS = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  FINALIZED: 'finalized',
};

// Sectors
const SECTORS = {
  BUDGET: 'budget',
  DEVELOPMENT: 'development',
  AGRICULTURE: 'agriculture',
  EDUCATION: 'education',
  HEALTH: 'health',
  INFRASTRUCTURE: 'infrastructure',
  TOURISM: 'tourism',
  OTHER: 'other',
};

// Nepal Districts
const DISTRICTS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal',
  'Biratnagar', 'Birgunj', 'Dharan', 'Janakpur', 'Hetauda',
  'Dhangadhi', 'Nepalgunj', 'Gorkha', 'Chitwan', 'Kaski'
];

module.exports = { ROLES, DRAFT_STATUS, SECTORS, DISTRICTS };