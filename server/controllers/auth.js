// controllers/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:schools(id, name, board, city, academic_year),
        child:child_id(id, name, grade, section, roll_no),
        peer:peer_id(id, name, grade, section, roll_no)
      `)
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    const userData = { ...user };
    delete userData.password;

    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:schools(id, name, board, city, academic_year),
        child:child_id(id, name, grade, section, roll_no),
        peer:peer_id(id, name, grade, section, roll_no)
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
