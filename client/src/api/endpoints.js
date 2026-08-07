/**
 * API Endpoints - One Health Focus
 */

const API = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Drafts
  DRAFTS: {
    BASE: '/drafts',
    GET_ALL: '/drafts',
    GET_ONE: (id) => `/drafts/${id}`,
    CREATE: '/drafts',
    UPDATE: (id) => `/drafts/${id}`,
    FINALIZE: (id) => `/drafts/${id}/finalize`,
    CONSENSUS: (id) => `/drafts/${id}/consensus`,
    IMPLEMENTATION: (id) => `/drafts/${id}/implementation`,
    DASHBOARD: '/drafts/one-health-dashboard',
  },
  
  // Reports
  REPORTS: {
    BASE: '/reports',
    CREATE: '/reports',
    STATS: '/reports/stats',
    TOP_DISTRICTS: '/reports/top-districts',
    ONE_HEALTH_SUMMARY: '/reports/one-health-summary',
    BY_DISTRICT: (district) => `/reports/district/${district}`,
    BY_CATEGORY: (category) => `/reports/category/${category}`,
    GET_ONE: (id) => `/reports/${id}`,
  },
  
  // Parliament
  PARLIAMENT: {
    BASE: '/parliament',
    GET_ALL: '/parliament',
    GET_ONE: (id) => `/parliament/${id}`,
    CREATE: '/parliament',
    VOTE: (id) => `/parliament/${id}/vote`,
    EXPERT_OPINION: (id) => `/parliament/${id}/expert-opinion`,
  },
  
  // Meetings
  MEETINGS: {
    CREATE: (draftId) => `/meetings/drafts/${draftId}`,
    GET: (draftId) => `/meetings/drafts/${draftId}`,
    DELETE: (draftId) => `/meetings/drafts/${draftId}`,
  },
  
  // Feedback
  FEEDBACK: {
    SUBMIT: (draftId) => `/drafts/${draftId}/feedback`,
    SUMMARY: (draftId) => `/drafts/${draftId}/feedback/summary`,
    GET_ALL: (draftId) => `/drafts/${draftId}/feedback`,
  },
  
  // Comments
  COMMENTS: {
    GET_ALL: (draftId) => `/drafts/${draftId}/comments`,
    CREATE: (draftId) => `/drafts/${draftId}/comments`,
  },
  
  // Simulator
  SIMULATOR: '/simulate',
};

export default API;