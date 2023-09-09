// models/Dataset.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tasks: [
    {
      title: 'String',
      description: 'String',
      completed: Boolean,
      createdAt: Date,
    },
    ],
    verified: {
        type: Boolean,
        default: false,
  },
  otp: Number,
  otp_expiry: Date,
  resetPasswordOtpExpiry: Date,

});

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")){
  return next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });   //delete account if otp expiry 

export const User = mongoose.model('User', userSchema);

export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    const user = await User.findById(req.user._id);

    user.tasks.push({
      title,
      description,
      completed: false,
      createdAt: new Date(Date.now()),
    });

    await user.save();

    res.status(200).json({ success: true, message: "Task added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);

    user.tasks = user.tasks.filter(
      (task) => task._id.toString() !== taskId.toString()
    );

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Task removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);

    user.task = user.tasks.find(
      (task) => task._id.toString() === taskId.toString()
    );

    user.task.completed = !user.task.completed;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Task Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// module.exports = Dataset;
