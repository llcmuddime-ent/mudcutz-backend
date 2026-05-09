// controllers/authControllers.js
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ======================
// LOGIN USER
// ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+hashed_password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login time
    user.last_login = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.hashed_password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// GET CURRENT LOGGED IN USER
// ======================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-hashed_password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================
// REGISTER USER
// ======================
export const register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashed_password = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullname,
      email,
      hashed_password,
      role
    });

    const savedUser = await user.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.hashed_password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};