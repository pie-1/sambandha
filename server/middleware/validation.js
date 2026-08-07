/**
 * Validation Middleware - One Health Focus
 * Validates request data with proper error handling
 */

const isValidEmail = (email) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

// Valid One Health categories
const ONE_HEALTH_CATEGORIES = [
  'maternal_health', 'child_nutrition', 'water_quality', 
  'air_quality', 'disease_prevention', 'healthcare_access',
  'zoonotic_diseases', 'climate_health'
];

const ONE_HEALTH_SECTORS = ['health', 'environment', 'one_health'];

/**
 * Validate User Registration
 */
exports.validateRegistration = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body is empty. Please provide user data.'
    });
  }

  const { name, email, password, role, phone } = req.body;
  const errors = [];

  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }
  if (!role || !['officer', 'expert', 'citizen'].includes(role)) {
    errors.push({ field: 'role', message: 'Please select a valid role' });
  }
  if (role === 'citizen' && (!phone || !isValidPhone(phone))) {
    errors.push({ field: 'phone', message: 'Citizens must provide a valid 10-digit phone number' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

/**
 * Validate Draft Creation - One Health Focus
 */
exports.validateDraft = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body is empty. Please provide draft data.'
    });
  }

  const { title, sector, subCategory, currentVersionText, district } = req.body;
  const errors = [];

  if (!title || title.length < 5 || title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be between 5 and 200 characters' });
  }

  // Only allow One Health sectors
  if (!sector || !ONE_HEALTH_SECTORS.includes(sector)) {
    errors.push({ 
      field: 'sector', 
      message: 'Sector must be: health, environment, or one_health' 
    });
  }

  // Validate sub-category if provided
  if (subCategory && !ONE_HEALTH_CATEGORIES.includes(subCategory)) {
    errors.push({ 
      field: 'subCategory', 
      message: 'Invalid sub-category for One Health' 
    });
  }

  if (!currentVersionText || currentVersionText.length < 10 || currentVersionText.length > 50000) {
    errors.push({ 
      field: 'currentVersionText', 
      message: 'Content must be between 10 and 50000 characters' 
    });
  }

  if (!district) {
    errors.push({ field: 'district', message: 'Please select a district' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

/**
 * Validate Comment
 */
exports.validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text || text.length < 1 || text.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Comment must be between 1 and 5000 characters'
    });
  }
  next();
};

/**
 * Validate Feedback
 */
exports.validateFeedback = (req, res, next) => {
  const { phone, reaction } = req.body;
  const errors = [];

  if (!phone || !isValidPhone(phone)) {
    errors.push({ field: 'phone', message: 'Please provide a valid 10-digit phone number' });
  }
  if (!reaction || !['approve', 'disapprove'].includes(reaction)) {
    errors.push({ field: 'reaction', message: 'Please select approve or disapprove' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

/**
 * Validate Report - One Health Focus
 */
exports.validateReport = (req, res, next) => {
  const { title, description, category, district, urgency } = req.body;
  const errors = [];

  if (!title || title.length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  }
  if (!description || description.length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }
  if (!category || !ONE_HEALTH_CATEGORIES.includes(category)) {
    errors.push({ field: 'category', message: 'Invalid One Health category' });
  }
  if (!district) {
    errors.push({ field: 'district', message: 'Please select a district' });
  }
  if (urgency && !['low', 'medium', 'high', 'critical'].includes(urgency)) {
    errors.push({ field: 'urgency', message: 'Invalid urgency level' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

/**
 * This validation middleware ensures all incoming requests meet One Health-specific validation rules. 
 * It validates user registration, draft creation, comments, feedback, and citizen reports. 
 * All sectors and categories are restricted to One Health domains.
 */