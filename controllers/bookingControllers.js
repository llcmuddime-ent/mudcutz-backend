// backend/controllers/bookingControllers.js
import Booking from '../models/booking.js';
import Service from '../models/service.js';
import Barber from '../models/barber.js';
import Payment from '../models/payment.js';

// ======================
// GET ALL BOOKINGS
// ======================
export const booking_index = async (req, res) => {
  try {
    const { status, barber, customer, startDate, endDate } = req.query;
    const user = req.user; // From auth middleware

    let query = {};
    if (status) query.status = status.toLowerCase();
    if (barber) query.barber = barber;
    if (customer) query.customer = customer;
    if (startDate || endDate) {
      query.start_time = {};
      if (startDate) query.start_time.$gte = new Date(startDate);
      if (endDate) query.start_time.$lte = new Date(endDate);
    }
   

    const queryBookings = await Booking.find(query)
      .populate('customer', 'fullname email phone')
      .populate({
        path: 'barber',
        populate: { path: 'user', select: 'fullname email phone' }
      })
      .populate('services', 'type duration price')   // Updated to plural
      .sort({ start_time: 1 });


    let bookings = [];
    // Role-based filtering
    if (user.role === 'admin') {
      bookings = queryBookings;
    } 
    else if (user.role === 'employee' || user.role === 'barber') {
      queryBookings.map(booking => {
      if (user.role == 'employee' && booking.barber.user._id.toString() === user._id.toString()) {
        bookings.push(booking);
      }
    }).filter(Boolean);
    } 
    else {
      // Other roles - return empty
      return res.json({ success: true, count: 0, data: [] });
    }

    

    res.status(200).json({
      success: true,
      count: bookings.length,
      user: { id: user.firstname, role: user.role },
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================
// CREATE NEW BOOKING (Multiple Services)
// ======================
export const booking_create = async (req, res) => {
  try {
    const { 
      customer, 
      barber, 
      services,        // Array of service IDs
      start_time, 
      end_time, 
      total_amount, 
      promo_used_count 
    } = req.body;

    // Validation
    if (!barber || !services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Barber and at least one service are required' 
      });
    }

    if (!start_time || !end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'start_time and end_time are required' 
      });
    }

    // Verify barber exists
    const barberDoc = await Barber.findById(barber);
    if (!barberDoc) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }

    // Verify all services exist
    const serviceDocs = await Service.find({ _id: { $in: services } });
    if (serviceDocs.length !== services.length) {
      return res.status(404).json({ success: false, message: 'One or more services not found' });
    }

    // Calculate total if not provided
    const calculatedTotal = total_amount || 
      serviceDocs.reduce((sum, service) => sum + (service.price || 0), 0);

    const newBooking = new Booking({
      customer: customer || null,
      barber,
      services,                    // Array
      start_time,
      end_time,
      total_amount: calculatedTotal,
      promo_used_count: promo_used_count || 0,
      status: 'pending'
    });

    const savedBooking = await newBooking.save();

    // Populate response
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('customer', 'fullname email phone')
      .populate('services', 'type duration price')   // Multiple services
      .populate({
        path: 'barber',
        populate: { path: 'user', select: 'fullname email phone' }
      });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully with multiple services',
      data: populatedBooking
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ======================
// GET SINGLE BOOKING
// ======================
export const booking_details = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'fullname email phone')
      .populate({
        path: 'barber',
        populate: { path: 'user', select: 'fullname email phone' }
      })
      .populate('services', 'type duration price')   // Updated to plural
      .sort({ start_time: 1 });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================
// UPDATE BOOKING
// ======================
export const booking_update = async (req, res) => {
  try {
    const { status, start_time, end_time, total_amount } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const oldStatus = booking.status;

    // Security: Prevent changes on completed bookings
    if (oldStatus === 'completed' && status !== 'completed') {
      return res.status(403).json({
        success: false,
        message: 'Completed bookings cannot be changed. Contact admin if needed.'
      });
    }

    // Update basic fields
    if (status) booking.status = status.toLowerCase();
    if (start_time) booking.start_time = start_time;
    if (end_time) booking.end_time = end_time;
    if (total_amount !== undefined) booking.total_amount = total_amount;

    // Handle Completion + Payment
    if (status === 'completed' && oldStatus !== 'completed') {
      const { amount, method, transaction_id } = req.body;

      if (!amount || !method) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount and method are required to complete booking'
        });
      }

      const newPayment = new Payment({
        type: 'SERVICE',
        booking: booking._id,
        barber: booking.barber,
        amount: parseFloat(amount),
        method,
        status: 'paid',
        transaction_id: transaction_id || `TX-BK-${booking._id}`,
        paid_at: new Date()
      });

      await newPayment.save();
      booking.status = 'completed';
    } 
    else if (status) {
      booking.status = status.toLowerCase();
    }

    const updatedBooking = await booking.save();

    const populated = await Booking.findById(updatedBooking._id)
      .populate('customer', 'fullname email')
      .populate('services', 'type')                    // Updated to plural
      .populate({
        path: 'barber',
        populate: { path: 'user', select: 'fullname email phone' }
      });

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: populated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ======================
// DELETE BOOKING
// ======================
export const booking_delete = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️  Attempting to delete booking: ${id}`);

    const bookingDeleted = await Booking.findByIdAndDelete(id);
    
    if (!bookingDeleted) {
      console.log(`❌ Booking not found: ${id}`);
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log(`✅ Successfully deleted booking: ${id}`);
    res.status(200).json({ success: true, message: 'Booking deleted successfully', deletedId: id });
  } catch (error) {
    console.error(`❌ Error deleting booking: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};