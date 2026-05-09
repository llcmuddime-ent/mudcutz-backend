import Payment from '../models/payment.js';
import Booking from '../models/booking.js';
import Product from '../models/product.js'; // For product sales

// ======================
// ADD SERVICE SALE (Barber & Admin)
// ======================
const addServiceSale = async (req, res) => {
  try {
    const { booking, amount, method, transaction_id } = req.body;
    const barberId = req.user._id;

    if (!amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment method are required'
      });
    }

    // Verify booking
    if (booking) {
      const existingBooking = await Booking.findById(booking);
      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    const newPayment = new Payment({
      type: 'SERVICE',
      booking: booking || null,
      barber: barberId,
      amount,
      method,
      status: 'paid',
      transaction_id,
      paid_at: new Date()
    });

    const savedPayment = await newPayment.save();

    const populatedPayment = await Payment.findById(savedPayment._id)
      .populate('booking', 'start_time end_time total_amount status')
      .populate('barber', 'fullname email');

    res.status(201).json({
      success: true,
      message: 'Service sale recorded successfully',
      data: populatedPayment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// ADD PRODUCT SALE
// ======================
const addProductSale = async (req, res) => {
  try {
    const { amount, method, transaction_id, productId, quantity = 1 } = req.body;
    const barberId = req.user._id;

    if (!amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment method are required'
      });
    }

    const newPayment = new Payment({
      type: 'PRODUCT',
      barber: barberId,
      amount,
      method,
      status: 'paid',
      transaction_id,
      paid_at: new Date()
    });

    const savedPayment = await newPayment.save();

    // Reduce stock
    if (productId) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock_quantity: -quantity }
      });
    }

    const populatedPayment = await Payment.findById(savedPayment._id)
      .populate('barber', 'fullname email');

    res.status(201).json({
      success: true,
      message: 'Product sale recorded successfully',
      data: populatedPayment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// GET SALES
// ======================
const getSales = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;

    let query = {};

    if (type) query.type = type.toUpperCase();
    if (status) query.status = status.toLowerCase();

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (req.user.role === 'employee' || req.user.role === 'barber') {
      query.barber = req.user._id;
    }

    const sales = await Payment.find(query)
      .populate('booking', 'start_time customer total_amount')
      .populate({
        path: 'barber',
        populate: {
          path: 'user',
          select: 'fullname email'
        }
  }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// GET SINGLE SALE
// ======================
const get_sales_details = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'start_time end_time status customer')
      .populate('barber', 'fullname email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    if (
      req.user.role === 'employee' &&
      payment.barber.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  addServiceSale,
  addProductSale,
  getSales,
  get_sales_details
};