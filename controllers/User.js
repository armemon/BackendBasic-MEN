import {User} from '../models/user.js';
import {sendMail} from '../utils/sendMail.js';
import {sendToken} from '../utils/sendToken.js';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import {initialDomainDatasets, initialDatasets} from './data.js';
import {DomainDataset} from '../models/domainDataset.js';
import {MeetingDataset} from '../models/dataset.js';

export const register = async (req, res) => {
  try {
    const {name, email, domain, password} = req.body;

    const avatar = req.files?.avatar.tempFilePath ?? '';

    let user = await User.findOne({email});
    // console.log(name, email, password);
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }
    const otp = Math.floor(Math.random() * 1000000);
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    let mycloud = {
      public_id: '',
      secure_url: '',
    };

    if (avatar) {
      mycloud = await cloudinary.uploader.upload(avatar, {
        folder: 'IEEEPES',
      });
      console.log(mycloud);
      fs.rmSync('./tmp', {recursive: true});
    }
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    await sendMail(email, 'Verify your account', `${name}, Your OTP is ${otp}`);
    sendToken(
      res,
      user,
      201,
      'OTP sent to your email, please verify your account',
    );
    // res.send("Ok")
  } catch (error) {
    res.status(500).json({success: false, message: `Error ${error.message}`});
  }
};

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const user = await User.findOne(req.user._otp); //Solve
    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res
        .status(400)
        .json({success: false, message: 'Invalid OTP or has been Expired'});
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, 'Account Verified');
  } catch (error) {
    res.status(500).json({success: false, message: `Error ${error.message}`});
  }
};

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    console.log(email, password);

    if (!email || !password) {
      return res
        .status(400)
        .json({success: false, message: 'Please enter all fields'});
    }
    const user = await User.findOne({email}).select('+password');
    // console.log(user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Email or Pasword',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Email or Pasword',
      });
    }

    sendToken(res, user, 200, 'Login Successfull');
  } catch (error) {
    res.status(500).json({success: false, message: `Error ${error.message}`});
  }
};

export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie('token', null, {
        expires: new Date(Date.now()),
      })
      .json({success: true, message: 'Logged out successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const addTask = async (req, res) => {
  try {
    const {title, description} = req.body;

    const user = await User.findById(req.user._id);

    user.tasks.push({
      title,
      description,
      completed: false,
      createdAt: new Date(Date.now()),
    });

    await user.save();

    res.status(200).json({success: true, message: 'Task added successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const removeTask = async (req, res) => {
  try {
    const {taskId} = req.params;

    const user = await User.findById(req.user._id);

    user.tasks = user.tasks.filter(
      task => task._id.toString() !== taskId.toString(),
    );

    await user.save();

    res.status(200).json({success: true, message: 'Task removed successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const updateTask = async (req, res) => {
  try {
    const {taskId} = req.params;

    const user = await User.findById(req.user._id);

    user.task = user.tasks.find(
      task => task._id.toString() === taskId.toString(),
    );

    user.task.completed = !user.task.completed;

    await user.save();

    res.status(200).json({success: true, message: 'Task Updated successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    sendToken(res, user, 201, `Welcome back ${user.name}`);
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const {name} = req.body;
    const avatar = req.files?.avatar.tempFilePath ?? '';

    if (name) user.name = name;
    if (avatar) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      const mycloud = await cloudinary.uploader.upload(avatar, {
        folder: 'IEEEPES',
      });
      fs.rmSync('./tmp', {recursive: true});

      user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    await user.save();

    res
      .status(200)
      .json({success: true, message: 'Profile Updated successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    const {oldPassword, newPassword} = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({success: false, message: 'Please enter all fields'});
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({success: false, message: 'Invalid Old Password'});
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({success: true, message: 'Password Updated successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const {email} = req.body;

    const user = await User.findOne({email});
    // console.log(email)
    if (!user) {
      return res.status(400).json({success: false, message: 'Invalid Email'});
    }

    const otp = Math.floor(Math.random() * 1000000);

    user.otp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `${name}, Your OTP for reseting the password is ${otp}. If you did not request for this, please ignore this email.`;

    await sendMail(email, 'Request for Reseting Password', message);

    res.status(200).json({success: true, message: `OTP sent to ${email}`});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const resetPassword = async (req, res) => {
  try {
    const {otp, newPassword} = req.body;

    const user = await User.findOne({
      otp: otp,
      resetPasswordOtpExpiry: {$gt: Date.now()},
    });

    if (!user) {
      return res
        .status(400)
        .json({success: false, message: 'Otp Invalid or has been Expired'});
    }
    user.password = newPassword;
    user.otp = null;
    user.resetPasswordOtpExpiry = null;
    await user.save();

    res
      .status(200)
      .json({success: true, message: `Password Changed Successfully`});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const getMeetingDataset = async (req, res) => {
  try {
    // const user = await User.findById(req.user._id);

    const meetingDataset = await MeetingDataset.findOne();

    res.status(200).json({success: true, meetingDataset: meetingDataset});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};
export const getDomainDataset = async (req, res) => {
  try {
    const domainDataset = await DomainDataset.findOne();

    res.status(200).json({success: true, meetingDataset: domainDataset});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const addDomainMember = async (req, res) => {
  try {
    const {domain, memberName, year} = req.body;

    const domainDataset = await DomainDataset.findOne().sort({_id: -1});

    domainDataset[domain].push({memberName, year});
    await domainDataset.save();
    res.status(200).json({
      success: true,
      message: 'Member added to meeting dataset.',
      data: domainDataset[domain],
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const editMeeting = async (req, res) => {
  try {
    const {
      selectedDataset,
      selectedMeetingIndex,
      updatedData,
      editedMemberIndex,
    } = req.body;

    const meetingDataset = await MeetingDataset.findOne();

    console.log(meetingDataset[selectedDataset][selectedMeetingIndex]);

    meetingDataset[selectedDataset][selectedMeetingIndex]['members'][
      editedMemberIndex
    ] = updatedData;
    await meetingDataset.save();
    res.status(200).json({
      success: true,
      message: 'Meeting data edited.',
      data: meetingDataset[selectedDataset][selectedMeetingIndex],
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};
export const addMeeting = async (req, res) => {
  try {
    const {domain, meeting} = req.body;

    const meetingDataset = await MeetingDataset.findOne().sort({_id: -1});

    meetingDataset[domain].push(meeting);
    await meetingDataset.save();
    res.status(200).json({
      success: true,
      message: 'Meeting added to meeting dataset.',
      data: meetingDataset[domain],
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};
export const ShiftMember = async (req, res) => {
  try {
    const {currentDomain, newDomain, memberIndex} = req.body;
    const domainDataset = await DomainDataset.findOne().sort({_id: -1});

    const memberToShift = domainDataset[currentDomain][memberIndex];
    domainDataset[currentDomain].splice(memberIndex, 1);
    domainDataset[newDomain].push(memberToShift);
    await domainDataset.save();

    res.status(200).json({
      success: true,
      message: 'Member shifted to another domain.',
      data: domainDataset,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const DeleteMember = async (req, res) => {
  try {
    const {domain, memberIndex} = req.body;
    const domainDataset = await DomainDataset.findOne().sort({_id: -1});

    domainDataset[currentDomain].splice(memberIndex, 1);
    await domainDataset.save();

    res.status(200).json({
      success: true,
      message: 'Member Deleted.',
      data: domainDataset,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const resetDomainDataset = async (req, res) => {
  try {
    const dataToInsert = initialDomainDatasets;
    const domainDataset = new DomainDataset(dataToInsert);

    domainDataset.save();
    res
      .status(200)
      .json({success: true, message: 'Data inserted/reset successfully.'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const resetMeetingDataset = async (req, res) => {
  try {
    const dataToInsert = initialDatasets;
    const domainDataset = new MeetingDataset(dataToInsert);

    domainDataset.save();
    res.status(200).json({
      success: true,
      message: 'Meeting Data inserted/ reset successfully.',
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};
