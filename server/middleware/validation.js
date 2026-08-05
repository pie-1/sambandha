/**
 * Validation Middleware
 * Validates request data
 */

const isValidEmail = (email) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

exports.validateRegistration = (req, res, next) => {
  const { name, email, password, role, phone } = req.body;
  const errors = [];

  if (!name || name.length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  if (!email || !isValidEmail(email)) errors.push({ field: 'email', message: 'Please provide a valid email' });
  if (!password || password.length < 6) errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  if (!role || !['officer', 'expert', 'citizen'].includes(role)) errors.push({ field: 'role', message: 'Please select a valid role' });
  if (role === 'citizen' && (!phone || !isValidPhone(phone))) errors.push({ field: 'phone', message: 'Citizens must provide a valid 10-digit phone number' });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

exports.validateDraft = (req, res, next) => {
  const { title, sector, currentVersionText, district } = req.body;
  const errors = [];

  const validSectors = ['budget', 'development', 'agriculture', 'education', 'health', 'infrastructure', 'tourism', 'other'];
  
  if (!title || title.length < 5 || title.length > 200) errors.push({ field: 'title', message: 'Title must be between 5 and 200 characters' });
  if (!sector || !validSectors.includes(sector)) errors.push({ field: 'sector', message: 'Please select a valid sector' });
  if (!currentVersionText || currentVersionText.length < 10 || currentVersionText.length > 50000) errors.push({ field: 'currentVersionText', message: 'Content must be between 10 and 50000 characters' });
  if (!district) errors.push({ field: 'district', message: 'Please select a district' });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

exports.validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text || text.length < 1 || text.length > 5000) {
    return res.status(400).json({ success: false, message: 'Comment must be between 1 and 5000 characters' });
  }
  next();
};

exports.validateFeedback = (req, res, next) => {
  const { phone, reaction } = req.body;
  const errors = [];

  if (!phone || !isValidPhone(phone)) errors.push({ field: 'phone', message: 'Please provide a valid 10-digit phone number' });
  if (!reaction || !['approve', 'disapprove'].includes(reaction)) errors.push({ field: 'reaction', message: 'Please select approve or disapprove' });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};