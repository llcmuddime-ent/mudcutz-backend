import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  type: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'PEDICURE',
      'BRAIDS',
      'LOCKS',
      'ADULT HAIRCUT',
      'KIDS HAIRCUT',
      'MASSAGE',
      'PIERCINGS',
      'TATTOOS',
      'BEARD TRIM',
      'HAIRCUT + BEARD COMBO',
      'WAVES',
      'HAIR DYE',
      'FACIAL',
      'SCALP TREATMENT',
      'HAIR WASH',
      'SHAVE',
      'OTHER'
    ],
    maxlength: [60, 'Service type cannot exceed 60 characters']
  },

  barber: {
    type: Schema.Types.ObjectId,
    ref: 'Barber',
    required: false,
    index: true
  },

  duration: {
    type: Number,
    required: true,
    min: [5, 'Duration must be at least 5 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },

  is_active: {
    type: Boolean,
    default: true,
    required: true
  },

  base_price: {
    type: Number,
    required: true,
    min: [0, 'Base price cannot be negative']
  },

  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Virtual
serviceSchema.virtual('barberInfo', {
  ref: 'Barber',
  localField: '_id',
  foreignField: 'barber',
  justOne: true
});


// Index
serviceSchema.index({ barber: 1, is_active: 1, type: 1 });


const Service = mongoose.model('Service', serviceSchema);

export default Service;