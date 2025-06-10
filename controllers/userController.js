const User = require('../modals/useModal');
const Application = require('../modals/applicationModel');
const Contact = require('../modals/contactModal');
const bcrypt = require('bcrypt');

// Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'User signed up!', user });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.user = user;
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

// Admin dashboard
exports.adminDashboard = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const applicationCount = await Application.countDocuments();
    const contactCount = await Contact.countDocuments();
    const latestApplications = await Application.find().sort({ createdAt: -1 }).limit(5);
    const latestContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      users,
      totalUsers: users.length,
      applicationCount,
      contactCount,
      latestApplications,
      latestContacts,
    });
  } catch (err) {
    res.status(500).json({ error: 'Dashboard fetch failed' });
  }
};
