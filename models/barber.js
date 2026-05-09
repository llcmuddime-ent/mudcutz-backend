import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const barberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  specialties: {
    type: [String],
    default: []
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
 });

// Ensure only employees can be barbers
barberSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const user = await mongoose.model('User').findById(this.user);
      if (!user || user.role !== 'employee') {
        return next(
          new Error('Barber profile can only be created for users with role "employee"')
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Barber = mongoose.model('Barber', barberSchema);

export default Barber;