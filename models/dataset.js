// models/Dataset.js
import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  domain: String,
  meetingName: String,
  date: Date,
  members: [
    {
      name: String,
      present: Boolean,
      reason: String,
      rating: Number,
    },
  ],
});

export const Dataset = mongoose.model('Dataset', datasetSchema);

// module.exports = Dataset;
