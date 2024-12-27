require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PASSWORD = process.env.DB_PASSWORD;

// Middleware
app.use(bodyParser.json());
app.use(cors());

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
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
