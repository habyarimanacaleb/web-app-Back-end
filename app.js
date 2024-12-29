require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const isAdmin= require('./middleware/IsAdmin');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PASSWORD = process.env.DB_PASSWORD;
const SECRET = process.env.SECRETE;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: SECRET, // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MongoDB connection
mongoose.connect(`mongodb+srv://caleb:${DB_PASSWORD}@cluster0.nyqydiu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the application schema
const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  highSchool: { type: String, required: true },
  grades: { type: Number, required: true },
  course: { type: String, required: true },
  message: { type: String, required: false },
});
const Application = mongoose.model('Application', applicationSchema);

// Define the contact information schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true },
  message: { type: String, required: true },
});
const Contact = mongoose.model('Contact', contactSchema);

// Define the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/apply', async (req, res) => {
  try {
    const applicationData = req.body;
    const existingApplication = await Application.findOne({ email: applicationData.email });

    if (existingApplication) {
      return res.status(400).json({ error: 'Application with this email already exists' });
    }
   
    const application = new Application(applicationData);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully!',application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Route to handle contact information submission
app.post('/contact', async (req, res) => {
  try {
    const contactData = req.body;
    const contact = new Contact(contactData);
    await contact.save();
    res.status(201).json({ message: 'Contact information submitted successfully!' });
  } catch (error) {
    console.error('Error saving contact information:', error);
    res.status(500).json({ error: 'Failed to submit contact information' });
  }
});
// Route to get contact messages
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
});
// Route to handle user sign-up
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password,role} = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword,role });
    await user.save();
    res.status(201).json({ message: 'User signed up successfully!', user });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ error: 'Failed to sign up user' });
  }
});
// Route to handle user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.user = user; // Save user session
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to log in user' });
  }
});
// Route to handle user logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out user' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Route to get all users (admin only)
app.get('/dashboard/users',isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Route to get trends data (admin only)
app.get('/dashboard/trends', async (req, res) => {
  try {
    // Example trends data
    const trends = {
      totalUsers: await User.countDocuments(),
      totalApplications: await Application.countDocuments(),
      totalContacts: await Contact.countDocuments(),
    };
    res.status(200).json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
