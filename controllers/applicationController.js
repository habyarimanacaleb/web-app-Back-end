const Application = require('../modals/applicationModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.ADMIN_PASS
  },
  tls: { rejectUnauthorized: false }
});

exports.submitApplication = async (req, res) => {
  try {
    const applicationData = req.body;

    if (!applicationData.email || !applicationData.idNumber || !applicationData.name || !applicationData.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await Application.findOne({ email: applicationData.email, idNumber: applicationData.idNumber });
    if (existing) return res.status(400).json({ error: 'Application already exists' });

    // Send admin email
    await transporter.sendMail({
      from: applicationData.email,
      to: process.env.EMAIL_ADMIN,
      subject: 'New Application Received',
      text: `New application from ${applicationData.name}\n\n${JSON.stringify(applicationData, null, 2)}`
    });

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: applicationData.email,
      subject: 'Application Received ✔️',
      text: `Dear ${applicationData.name},\n\nWe have received your application.\n\nBest,\nCalebTech`
    });

    const application = new Application(applicationData);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully!', application });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching application' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const updates = req.body;

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updates,
      { new: true } // return the updated document
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application updated successfully', updatedApplication });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;

    const deletedApplication = await Application.findByIdAndDelete(applicationId);

    if (!deletedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully', deletedApplication });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

exports.deleteAllApplications = async (req, res) => {
  try {
    const result = await Application.deleteMany();

    res.json({ message: 'All applications deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all applications' });
  }
};