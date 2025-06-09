require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const isAdmin = require('./middleware/IsAdmin');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(bodyParser.json());
app.use(cors());
const allowedOrigins = [
  'http://127.0.0.1:5500/', // Local development
  'https://calebtech-studio.netlify.app/', // Replace with your real deployed frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you're using cookies/sessions
}));
app.use(bodyParser.urlencoded({ extended: true }));
// Session middleware
app.use(session({
  secret: process.env.SECRET|| 'MY&SECRET!KEY', // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));
// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.ADMIN_PASS,
  },
});

// MongoDB connection
mongoose.connect(process.env.DB_URI || `mongodb://localhost:27017/applications`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the application schema
const applicationSchema = new mongoose.Schema({
  address: { type: String, require: false },

  cell: { type: String, require: false },

  completionYear: { type: String, require: false },

  country: { type: String, require: false },

  course: { type: String, require: false },

  disability: { type: String, require: false },

  district: { type: String, require: false },

  dob: { type: String, require: false },

  email: { type: String, require: false },

  fatherName: { type: String, require: false },

  gender: { type: String, require: false },

  grades: { type: String, require: false },

  guardianName: { type: String, require: false },

  highSchool: { type: String, require: false },

  idNumber: { type: String, require: false },

  indexNumber: { type: String, require: false },

  message: { type: String, require: false },

  motherName: { type: String, require: false },

  name: { type: String, require: false },

  nationality: { type: String, require: false },

  otherCourse: { type: String, require: false },

  phone: { type: String, require: false },

  sector: { type: String, require: false },

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
  enum: ['admin', 'user'], // Define roles
  role: { type: String, default: 'user' },
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/apply', async (req, res) => {
  try {
    const applicationData = req.body;
    const existingApplication = await Application.findOne({ email: applicationData.email, idNumber: applicationData.idNumber });

    if (existingApplication) {
      return res.status(400).json({ error: 'Application with this emailand Id Number already exists' });
    }


    const mailOptions = {
      from: applicationData.email, // Use the applicant's email as the sender
      to: process.env.EMAIL_ADMIN, // Admin email
      subject: 'New Application Received',
      text: `New application received from ${applicationData.name} (${applicationData.email}).\n\nDetails:\n${JSON.stringify(applicationData, null, 2)}`,
    };

    await transporter.sendMail(mailOptions);
    //Create a new application instance and save it to the database

    if (!applicationData.email || !applicationData.idNumber) {
      return res.status(400).json({ error: 'Email and ID Number are required' });
    }
    if (!applicationData.name || !applicationData.phone) {
      return res.status(400).json({ error: 'Name and Phone are required' });
    }
    if (!applicationData.course || !applicationData.grades) {
      return res.status(400).json({ error: 'Course and Grades are required' });
    }
    if (!applicationData.dob || !application.contact) {
      return res.status(400).json({ error: 'Date of Birth and Contact are required' });
    }
    if (!applicationData.address || !applicationData.country) {
      return res.status(400).json({ error: 'Address and Country are required' });
    }


    const application = new Application(applicationData);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 }); // Sort by creation date, most recent first
    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: 'No applications found' });
    }
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

//get application by id with querries
app.get('/api/applications/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch application' });
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
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
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
app.get('/dashboard/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Sort by creation date, most recent first
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    const applicationCount = await Application.countDocuments();
    const contactCount = await Contact.countDocuments();
    const applicants = await Application.find().sort({ createdAt: -1 }); // Sort
    const contacts = await Contact.find().sort({ createdAt: -1 }); // Sort
    // You can also fetch the latest applications if needed
    const latestApplications = await Application.find().sort({ createdAt: -1 }).limit(5);

    // Fetch contact messages if needed
    const latestContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);

    // Return users, application count, and contact count
    res.status(200).json({ users, contacts, applicants, latestApplications, latestContacts, applicationCount, contactCount });
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
