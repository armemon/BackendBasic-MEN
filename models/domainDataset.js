import mongoose from 'mongoose';

// Define a schema for the member objects
const memberSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: true,
  },
  year:{
    type: String,
    required: true,
  },
});

// Define the schema for the DomainDatasets collection
const domainDatasetSchema = new mongoose.Schema({
  IT: [memberSchema],
  Doc: [memberSchema],
  PR: [memberSchema],
  RnD: [memberSchema],
  EM: [memberSchema],
  HR: [memberSchema],
  GM: [memberSchema],
  MR: [memberSchema],
});

// Create a model for the DomainDatasets collection
export const DomainDataset = mongoose.model('DomainDataset', domainDatasetSchema);
