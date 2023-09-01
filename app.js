// const express = require('express');
import express from 'express';
import User from "./routers/User.js"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import cors from "cors"
// import datasetsRouter from "./router/Datasets.js"

// Create an instance of Express app
export const app = express();
 
// Import and use routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
    limit: { fileSize: 50 * 1024 * 1024 },
    useTempFiles:true
}))
app.use(cors())

app.use('/api/v1', User); // Define your API route prefix
// app.use('/api/v1', datasetsRouter); // Define your API route prefix
