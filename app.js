require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://calebtech-studio.netlify.app'],
  credentials: true
}));

app.use(session({
  secret: process.env.SECRET || 'MY&SECRET!KEY',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 86400000 }
}));

// DB Connection
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017')
mongoose.connection.on('error', console.error);
mongoose.connection.once('open', () => console.log('MongoDB Connected'));

// Routes
app.use('/api', require('./routes/applicationRoute'));
app.use('/api', require('./routes/contactRoute'));
app.use('/api', require('./routes/userRoute'));

// Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
