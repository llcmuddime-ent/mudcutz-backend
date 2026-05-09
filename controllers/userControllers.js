import User from "../models/user.js";
import Barber from "../models/barber.js";
import bcrypt from "bcryptjs";

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-hashed_password'); // hide password
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// Get all barbers (admin only)
export const getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find().populate('user', 'fullname email phone');
    res.status(200).json({ success: true, count: barbers.length, data: barbers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching barbers' });
  }
}

// Get a single user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-hashed_password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
};

// Get a single barber by ID (admin only)
export const getBarberById = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id)
    .populate('user', 'fullname email phone');

    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: barber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching barber' });
  }
};

// Create a new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { email, fullname, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Hash password
    const hashed_password = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      fullname,
      phone,
      hashed_password,
      role: role || 'customer'
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.hashed_password;

    res.status(201).json({ success: true, data: userResponse });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message || 'Error creating user' });
  }
};


// Create a new barber (admin only)
export const createBarber = async (req, res) => {
  try {
    const { email, fullname, phone, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Hash password
    const hashed_password = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      fullname,
      phone,
      hashed_password,
      role: 'employee'
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.hashed_password;

    // Create corresponding barber entry
    const newBarber = new Barber({
      user: savedUser._id
    });

    const savedBarber = await newBarber.save();
    res.status(201).json({ success: true, data: { user: userResponse, barber: savedBarber } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message || 'Error creating barber' });
  }
};

// Update a user (admin only)
export const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Hash password if updating
    if (updateData.password) {
      updateData.hashed_password = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-hashed_password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message || 'Error updating user' });
  }
};

// Update a barber (admin only)
export const updateBarber = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const barberExists = await Barber.findById(req.params.id);
    if (!barberExists) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      barberExists.user,
      { fullname: updateData.fullname, phone: updateData.phone },
      { new: true, runValidators: true }
    );

    // Update barber fields
    const updatedBarber = await Barber.findByIdAndUpdate(
      barberExists._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBarber || !updatedUser) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }

    return res.json({
      success: true,
      user: updatedUser,
      barber: updatedBarber
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message || 'Error updating barber' });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

// Delete a barber (admin only)
export const deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }

    await Barber.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Barber deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deleting barber' });
  }
};