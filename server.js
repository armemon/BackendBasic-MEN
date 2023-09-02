// backend/index.js

// Import necessary packages
import bodyParser from 'body-parser';
import cors from 'cors';
import { connectDatbase } from './config/database.js';
import {v2 as cloudinary} from "cloudinary"

import { app } from './app.js';
import { config } from 'dotenv'

config({
  path: './config/config.env', // load this file, if it exists
})

          
cloudinary.config({ 
  cloud_name: 'dxcijzrex', 
  api_key: '892676688774548', 
  api_secret: 'xc-9ZbDZE9W9TMI7hq3IC651om8' 
});
  
connectDatbase();

// Create an instance of Express app
// const app = express();

// Middleware
// app.use(bodyParser.json());
// app.use(cors());


// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//     console.log('Connected to MongoDB');
// //   console.log(db);
    
// });

// Import and use routes
// const datasetsRouter = require('./routes/datasets'); // Update the path accordingly
// app.use('/api', datasetsRouter); // Define your API route prefix

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
