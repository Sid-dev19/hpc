// routes/users.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);

// Admin: list/create/update users
router.get('/', authorise('admin'), async (req, res) => {
  try {
    const { role, grade, section } = req.query;
    let query = supabase
      .from('users')
      .select('*, school:schools(name, board, city)')
      .eq('school_id', req.user.school_id)
      .eq('is_active', true);

    if (role) query = query.eq('role', role);
    if (grade) query = query.eq('grade', Number(grade));
    if (section) query = query.eq('section', section);

    const { data: users, error } = await query.order('name');

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPasswords);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

router.post('/', authorise('admin'), async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        password: hashedPassword,
        school_id: req.user.school_id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) { 
    res.status(400).json({ message: err.message }); 
  }
});

router.put('/:id', authorise('admin'), async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    
    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) { 
    res.status(400).json({ message: err.message }); 
  }
});

router.delete('/:id', authorise('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'User deactivated' });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Teacher: get students in their sections
router.get('/my-students', authorise('teacher'), async (req, res) => {
  try {
    const { grade, section } = req.query;
    let query = supabase
      .from('users')
      .select('name, grade, section, roll_no, peer:peer_id(name, grade, section)')
      .eq('school_id', req.user.school_id)
      .eq('role', 'student')
      .eq('is_active', true);

    if (grade) query = query.eq('grade', Number(grade));
    if (section) query = query.eq('section', section);

    const { data: students, error } = await query.order('name');

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(students);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Student: get own peer
router.get('/my-peer', authorise('student'), async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from('users')
      .select('peer:peer_id(name, grade, section)')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(student.peer);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Parent: get child info
router.get('/my-child', authorise('parent'), async (req, res) => {
  try {
    const { data: parent, error } = await supabase
      .from('users')
      .select('child:child_id(*)')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(parent.child);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

module.exports = router;
