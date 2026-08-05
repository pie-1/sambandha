/**
 * Role Check Middleware
 * Restricts routes to specific roles
 */

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required: ${roles.join(' or ')}` 
      });
    }
    
    next();
  };
};

module.exports = { requireRole };