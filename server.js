import bodyParser from 'body-parser';
import cors from 'cors';
import { connectDatbase } from './config/database.js';
import { v2 as cloudinary } from 'cloudinary';
import { app } from './app.js';
import { config } from 'dotenv';
// import http from 'http'; // Import the 'http' module
// import { Server } from 'socket.io'; // Import the 'socket.io' library

config({
  path: './config/config.env', // Load this file if it exists
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

connectDatbase();

// Create an HTTP server and pass it to socket.io
// const server = http.createServer(app);
// const io = new Server(server); // Create a new instance of Socket.io

// // Define WebSocket event handling here
// io.on('connection', (socket) => {
//   console.log('A client connected.');

//   // Handle custom events here
//   socket.on('datasetUpdate', (data) => {
//     // Broadcast the updated data to all connected clients
//     io.emit('datasetUpdate', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('A client disconnected.');
//   });
// });

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
