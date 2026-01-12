import { Booking } from "../models/booking.js";

// Get all bookings (admin) or user's bookings
export const getBookings = async (req, res) => {
  try {
    const { userId, homestayId, status } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (homestayId) filter.homestayId = homestayId;
    if (status) filter.bookingStatus = status;

    const bookings = await Booking.find(filter)
      .populate("homestayId", "name location image")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single booking
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "homestayId",
      "name location image address hostName hostPhone"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create booking
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // Calculate nights
    const checkin = new Date(bookingData.checkin);
    const checkout = new Date(bookingData.checkout);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

    // Calculate pricing
    const basePrice = bookingData.basePrice * nights;
    const taxes = basePrice * 0.12; // 12% GST
    const platformFee = basePrice * 0.05; // 5% platform fee
    const totalPrice = basePrice + taxes + platformFee;

    const booking = new Booking({
      ...bookingData,
      nights,
      basePrice,
      taxes,
      platformFee,
      totalPrice,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.bookingStatus = bookingStatus;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId, paymentMethod } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentId) booking.paymentId = paymentId;
    if (paymentMethod) booking.paymentMethod = paymentMethod;

    if (paymentStatus === "paid") {
      booking.bookingStatus = "confirmed";
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Check availability
export const checkAvailability = async (req, res) => {
  try {
    const { homestayId, roomId, checkin, checkout } = req.query;

    const conflictingBookings = await Booking.find({
      homestayId,
      roomId,
      bookingStatus: { $in: ["confirmed", "pending"] },
      $or: [
        {
          checkin: { $lte: new Date(checkout) },
          checkout: { $gte: new Date(checkin) },
        },
      ],
    });

    res.json({
      available: conflictingBookings.length === 0,
      conflictingBookings: conflictingBookings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get blocked dates for a room
export const getBlockedDates = async (req, res) => {
  try {
    const { homestayId, roomId } = req.query;

    const bookings = await Booking.find({
      homestayId,
      roomId,
      bookingStatus: { $in: ["confirmed", "pending"] },
      checkout: { $gte: new Date() },
    }).select("checkin checkout");

    const blockedDates = bookings.map((booking) => ({
      start: booking.checkin,
      end: booking.checkout,
    }));

    res.json(blockedDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { refundAmount } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.refundAmount = refundAmount;
    booking.refundStatus = "processed";
    booking.paymentStatus = "refunded";
    booking.bookingStatus = "cancelled";

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
