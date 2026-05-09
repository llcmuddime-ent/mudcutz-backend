import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const bookingSchema = new Schema({

  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },

  barber: {
    type: Schema.Types.ObjectId,
    ref: 'Barber',
    required: true,
    index: true
  },

  // Changed from single service to array of services
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  }],

  start_time: {
    type: Date,
    required: true
  },

  end_time: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    lowercase: true,
    required: true
  },

  total_amount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
    default: 0
  },

  promo_used_count: {
    type: Number,
    default: 0,
    min: 0
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save validation: end_time must be after start_time
bookingSchema.pre('save', function (next) {
  if (this.start_time && this.end_time && this.end_time <= this.start_time) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

// Virtuals
bookingSchema.virtual('duration_minutes').get(function () {
  if (!this.start_time || !this.end_time) return 0;
  const diffMs = this.end_time - this.start_time;
  return Math.round(diffMs / (1000 * 60));
});

bookingSchema.virtual('is_upcoming').get(function () {
  return this.start_time > new Date() &&
    ['pending', 'confirmed'].includes(this.status);
});

// Optional: Virtual to populate all services
bookingSchema.virtual('serviceDetails', {
  ref: 'Service',
  localField: 'services',
  foreignField: '_id'
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;