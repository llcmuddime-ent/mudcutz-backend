import Payment from "../models/payment.js";
import Booking from "../models/booking.js";

// ======================
// DAILY REPORT
// ======================
export const getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const payments = await Payment.find({
      createdAt: { $gte: today }
    }).populate('barber', 'fullname');

    const totalSales = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const serviceSales = payments
      .filter(p => p.type === 'SERVICE')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const productSales = payments
      .filter(p => p.type === 'PRODUCT')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      totalSales,
      serviceSales,
      productSales,
      totalTransactions: payments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================
// WEEKLY REPORT
// ======================
export const getWeeklyReport = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const payments = await Payment.find({
      createdAt: { $gte: last7Days }
    });

    const grouped = {};
    payments.forEach(p => {
      const day = p.createdAt.toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + (p.amount || 0);
    });

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================
// MONTHLY REPORT
// ======================
export const getMonthlyReport = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const payments = await Payment.find({
      createdAt: { $gte: startOfMonth }
    });

    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      totalSales: total,
      transactionCount: payments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================
// BARBER PERFORMANCE
// ======================
export const getBarberPerformance = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('barber', 'fullname');

    const performance = {};

    payments.forEach(p => {
      const barberName = p.barber?.fullname || 'Unknown Barber';
      performance[barberName] = (performance[barberName] || 0) + (p.amount || 0);
    });

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================
// SERVICE INSIGHTS
// ======================
export const getServiceInsights = async (req, res) => {
  try {
    const payments = await Payment.find({ type: 'SERVICE' })
      .populate('booking', 'service'); // If you want service details

    const insights = {};

    payments.forEach(p => {
      const serviceName = p.booking?.service?.type || 'Unknown Service';
      insights[serviceName] = (insights[serviceName] || 0) + (p.amount || 0);
    });

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================
// PRODUCT INSIGHTS
// ======================
export const getProductInsights = async (req, res) => {
  try {
    const payments = await Payment.find({ type: 'PRODUCT' });

    const insights = {};

    payments.forEach(p => {
      const productName = p.product?.name || 'Unknown Product';
      insights[productName] = (insights[productName] || 0) + (p.amount || 0);
    });

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};