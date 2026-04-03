const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorised – no token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:schools(id, name, board, city)
      `)
      .eq('id', decoded.id)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Remove password from user object
    delete user.password;
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Restrict to specific roles
exports.authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' is not permitted for this action` });
  }
  next();
};
