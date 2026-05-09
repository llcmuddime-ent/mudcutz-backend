import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['SERVICE', 'PRODUCT'],
    trim: true
  },

  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: false,
    index: true
  },

  barber: {
    type: Schema.Types.ObjectId,
    ref: 'Barber',
    required: true,
    index: true
  },

  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },

  method: {
    type: String,
    required: true,
    enum: ['cash', 'mobile_money', 'card', 'promo'],
    lowercase: true,
    trim: true
  },

  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
    lowercase: true
  },

  paid_at: {
    type: Date
  },

  transaction_id: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Virtual
paymentSchema.virtual('bookingInfo', {
  ref: 'Booking',
  localField: 'booking',
  foreignField: '_id',
  justOne: true
});


// Indexes
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ transaction_id: 1 }, { unique: true, sparse: true });
paymentSchema.index({ barber: 1, status: 1 });


// Auto set paid_at
paymentSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'paid' && !this.paid_at) {
    this.paid_at = new Date();
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;