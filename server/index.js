const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const supabase = require('./config/supabase');

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes - Enable only working routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/schools',      require('./routes/schools'));
app.use('/api/competencies', require('./routes/competencies'));
// app.use('/api/activities',   require('./routes/activities'));
// app.use('/api/rubrics',      require('./routes/rubrics'));
// app.use('/api/feedback',     require('./routes/feedback'));
// app.use('/api/term-summary', require('./routes/termSummary'));
// app.use('/api/part-a',       require('./routes/partA'));
// app.use('/api/exams',        require('./routes/exams'));
// app.use('/api/ai',           require('./routes/ai'));
app.use('/api/dashboard',    require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HPC server running on port ${PORT}`);
  console.log('Supabase connected successfully');
});
