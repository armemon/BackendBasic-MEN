import express from 'express';
import {
  register,
  verify,
  login,
  logout,
  addTask,
  updateTask,
  removeTask,
  getMyProfile,
  updateProfile,
  updatePassword,
  forgetPassword,
  resetPassword,
} from '../controllers/User.js';
import {isAuthenticated} from '../middleware/auth.js';

const router = express.Router();

// const Dataset = require('../models/Dataset');

router.route('/register').post(register);

router.route('/verify').post(isAuthenticated, verify);

router.route('/login').post(login);
router.route('/logout').get(logout);

router.route('/newtask').post(isAuthenticated, addTask);
router.route('/me').get(isAuthenticated, getMyProfile);

router
  .route('/task/:taskId')
  .get(isAuthenticated, updateTask)
  .delete(isAuthenticated, removeTask);

router.route('/updateprofile').put(isAuthenticated, updateProfile);
router.route('/updatepassword').put(isAuthenticated, updatePassword);

router.route('/forgetpassword').post(forgetPassword);
router.route('/resetpassword').put(resetPassword);

// // Route to get datasets
// router.get('/datasets', async (req, res) => {
//   try {
//     const datasets = await Dataset.find();
//     res.json(datasets);
//   } catch (error) {
//     res.status(500).json({message: error.message});
//   }
// });

export default router;
