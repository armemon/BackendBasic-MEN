// models/Dataset.js
import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  meetingName: String,
  date: String,
  members: [
    {
      name: String,
      present: Boolean,
      reason: String,
      rating: String,
    },
  ],
});

const meetingDatasetSchema = new mongoose.Schema({
  IT: [meetingSchema],
  Doc: [meetingSchema],
  PR: [meetingSchema],
  RnD: [meetingSchema],
  EM: [meetingSchema],
  HR: [meetingSchema],
  GM: [meetingSchema],
  MR: [meetingSchema],
});

export const MeetingDataset = mongoose.model('MeetingDataset', meetingDatasetSchema);

// module.exports = Dataset;
