const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  address: String,
  cell: String,
  completionYear: String,
  country: String,
  course: String,
  disability: String,
  district: String,
  dob: String,
  email: String,
  fatherName: String,
  gender: String,
  grades: String,
  guardianName: String,
  highSchool: String,
  idNumber: String,
  indexNumber: String,
  message: String,
  motherName: String,
  name: String,
  nationality: String,
  otherCourse: String,
  phone: String,
  sector: String,
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
