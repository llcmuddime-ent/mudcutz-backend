import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },

  type: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Hair Product',
      'Beard Product',
      'Aftercare',
      'Styling Product',
      'Shaving Product',
      'Tool',
      'Merchandise',
      'Other'
    ],
  },

  stock_quantity: {
    type: Number,
    required: true,
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },

  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },

  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  brand: {
    type: String,
    trim: true
  },

  low_stock_threshold: {
    type: Number,
    default: 5
  },

  image_url: {
    type: [String],
    trim: true
  },

  barcode: {
    type: String,
    unique: true,
    sparse: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hook
productSchema.pre('save', function (next) {
  if (this.stock_quantity < 0) {
    this.stock_quantity = 0;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;