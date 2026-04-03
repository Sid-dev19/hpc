// server/utils/seed.js
// Run: node utils/seed.js
const bcrypt = require('bcryptjs');
const path = require('path');
const supabase = require('../config/supabase');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  console.log('Connecting to Supabase...');

  // School
  let { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('name', 'Vidya Bharati Public School')
    .single();

  if (schoolError && schoolError.code === 'PGRST116') {
    // School doesn't exist, create it
    const { data: newSchool, error: createError } = await supabase
      .from('schools')
      .insert({
        name: 'Vidya Bharati Public School',
        board: 'CBSE',
        city: 'New Delhi',
        academic_year: '2024-25'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating school:', createError);
      return;
    }
    school = newSchool;
    console.log('School created:', school.id);
  } else if (schoolError) {
    console.error('Error checking school:', schoolError);
    return;
  }

  // Subjects
  const subjects = [
    'Science', 'Mathematics', 'Language R1', 'Language R2', 
    'Social Science', 'Art Education', 'Physical Education', 'Vocational Education'
  ];

  for (const subjectName of subjects) {
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('*')
      .eq('name', subjectName)
      .eq('stage', 'middle')
      .single();

    if (!existingSubject) {
      const { error: createError } = await supabase
        .from('subjects')
        .insert({
          name: subjectName,
          code: subjectName.replace(/\s+/g, '').toUpperCase().slice(0, 4),
          stage: 'middle'
        });

      if (createError) {
        console.error(`Error creating subject ${subjectName}:`, createError);
      }
    }
  }
  console.log('Subjects seeded');

  // Users
  const users = [
    { name: 'Anand Kumar', email: 'admin@vidyabharati.edu', password: 'demo123', role: 'admin' },
    { name: 'Sunita Rao', email: 'teacher@vidyabharati.edu', password: 'demo123', role: 'teacher' },
    { name: 'Arjun Verma', email: 'student@vidyabharati.edu', password: 'demo123', role: 'student', grade: 6, section: 'A', roll_no: '6A-01' },
    { name: 'Zara Sheikh', email: 'peer@vidyabharati.edu', password: 'demo123', role: 'student', grade: 6, section: 'A', roll_no: '6A-02' },
    { name: 'Ramesh Verma', email: 'parent@vidyabharati.edu', password: 'demo123', role: 'parent' },
    { name: 'Meera Iyer', email: 'student2@vidyabharati.edu', password: 'demo123', role: 'student', grade: 7, section: 'A', roll_no: '7A-01' },
    { name: 'Deepak Menon', email: 'teacher2@vidyabharati.edu', password: 'demo123', role: 'teacher' },
  ];

  const createdUsers = {};

  for (const user of users) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert({
          ...user,
          password: hashedPassword,
          school_id: school.id
        })
        .select()
        .single();

      if (createError) {
        console.error(`Error creating user ${user.name}:`, createError);
      } else {
        createdUsers[user.email] = createdUser;
        console.log(`User created: ${createdUser.name} (${createdUser.role})`);
      }
    } else {
      createdUsers[user.email] = existingUser;
    }
  }

  // Link parent to child
  const parent = createdUsers['parent@vidyabharati.edu'];
  const student = createdUsers['student@vidyabharati.edu'];
  const peer = createdUsers['peer@vidyabharati.edu'];

  if (parent && student) {
    await supabase
      .from('users')
      .update({ child_id: student.id })
      .eq('id', parent.id);

    if (peer) {
      await supabase
        .from('users')
        .update({ peer_id: peer.id })
        .eq('id', student.id);
    }
    console.log('Parent-child and peer links set');
  }

  console.log('\n✓ Seed complete. Demo accounts:');
  console.log('  admin@vidyabharati.edu    / demo123  (Admin)');
  console.log('  teacher@vidyabharati.edu  / demo123  (Teacher)');
  console.log('  student@vidyabharati.edu  / demo123  (Student - Arjun Verma, Grade 6A)');
  console.log('  peer@vidyabharati.edu     / demo123  (Student/Peer - Zara Sheikh)');
  console.log('  parent@vidyabharati.edu   / demo123  (Parent - Ramesh Verma)');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
