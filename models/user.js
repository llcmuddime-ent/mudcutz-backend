// models/user.js
import mongoose from 'mongoose';
const { Schema } = mongoose;
import Barber from './barber.js';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },

  fullname: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  hashed_password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ['admin', 'customer', 'employee'],
    default: 'customer',
    lowercase: true,
    required: true
  },

  is_active: {
    type: Boolean,
    default: true
  },

  last_login: {
    type: Date
    // Will be updated on successful login
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Whenever a user is saved/updated
userSchema.post('save', async function (doc) {
  try {
    if (doc.role === 'employee') {
      // Create or update corresponding Barber document
      await Barber.findOneAndUpdate(
        { user: doc._id },           // match by user id
        { user: doc._id },           // keep ID in sync
        { upsert: true, new: true }       // create if missing
      );
    } else {
      // Optional: remove barber document if role changed away from employee
      await Barber.deleteOne({ user: doc._id });
    }
  } catch (err) {
    console.error('Error syncing Barber model:', err);
  }})


// ✅ Export as ES Module default
export default mongoose.model('User', userSchema);