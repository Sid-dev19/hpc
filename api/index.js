// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('../server/config/supabase');

dotenv.config();

const app = express();

// CORS configuration for Vercel
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Import all routes
app.use('/api/auth',         require('../server/routes/auth'));
app.use('/api/users',        require('../server/routes/users'));
app.use('/api/schools',      require('../server/routes/schools'));
app.use('/api/competencies', require('../server/routes/competencies'));
app.use('/api/activities',   require('../server/routes/activities'));
app.use('/api/rubrics',      require('../server/routes/rubrics'));
app.use('/api/feedback',     require('../server/routes/feedback'));
app.use('/api/term-summary', require('../server/routes/termSummary'));
app.use('/api/part-a',       require('../server/routes/partA'));
app.use('/api/exams',        require('../server/routes/exams'));
app.use('/api/ai',           require('../server/routes/ai'));
app.use('/api/dashboard',    require('../server/routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

module.exports = app;
