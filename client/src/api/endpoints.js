/**
 * API Endpoints
 */

const API = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  DRAFTS: {
    BASE: '/drafts',
    GET_ALL: '/drafts',
    GET_ONE: (id) => `/drafts/${id}`,
    CREATE: '/drafts',
    UPDATE: (id) => `/drafts/${id}`,
    FINALIZE: (id) => `/drafts/${id}/finalize`,
  },
  COMMENTS: {
    GET_ALL: (id) => `/drafts/${id}/comments`,
    CREATE: (id) => `/drafts/${id}/comments`,
  },
  FEEDBACK: {
    SUBMIT: (id) => `/drafts/${id}/feedback`,
    SUMMARY: (id) => `/drafts/${id}/feedback/summary`,
    GET_ALL: (id) => `/drafts/${id}/feedback`,
  },
  MEETINGS: {
    CREATE: (id) => `/meetings/drafts/${id}`,
    GET: (id) => `/meetings/drafts/${id}`,
    DELETE: (id) => `/meetings/drafts/${id}`,
  },
  SIMULATOR: '/simulate',
  SIMULATOR_METADATA: '/simulate/metadata',
  ML_HEALTH: {
    SIMULATE: '/ml/health/simulate',
    METADATA: '/ml/health/metadata',
  },
  PRIORITIES: {
    VOTE: '/priorities',
    RANKING: '/priorities/ranking',
  },
  PROJECTS: {
    BASE: '/projects',
    STATS: '/projects/stats',
  },
  FEEDBACK_DISTRICTS: (id) => `/drafts/${id}/feedback/summary/districts`,
};

export default API;