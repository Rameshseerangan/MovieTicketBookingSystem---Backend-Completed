import User from "../Models/userModel.js";
import Theater from "../Models/TheaterSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import BookingModel from "../Models/BookingModel.js";
import razorpayInstance from "../Database/razorpay.js";
import crypto from "crypto";
import axios from "axios";

dotenv.config();

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role: role || "user", // Default user
    });

    await newUser.save();

    res
      .status(200)
      .json({ message: "User Registered Successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find by mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Compare the password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role }, // Include role in the token
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.token = token;
    await user.save();
    // Construct the response
    const response = {
      message:
        user.role === "admin"
          ? "Admin Logged In Successfully"
          : "User Logged In Successfully",
      token,
      role: user.role,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

<<<<<<< HEAD
=======
// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.PASS_MAIL,
        pass: process.env.PASS_KEY,
        
      },
    });
    const mailOptions = {
      from: process.env.PASS_MAIL,
      to: user.email,
      subject: "Password Reset Link",
      text: `You are receiving this because you have requested the reset of the password for your account.
      Please click the following link or paste it into your browser to complete the process:
      http://localhost:5000/api/auth/reset-password/${user._id}/${token}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error in sending the mail" });
      } else {
        res.status(200).json({ message: "Email Sent Successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid Token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

>>>>>>> 5420107e4fe2fa759772ae69b1f66737b6efe55d
// Save ticket booking and send the email with the booking details
export const saveBookingAndSendEmail = async (req, res) => {
  try {
    const { email, phone, paymentType, ticketInfo } = req.body;

    // Validate ticket info and required fields
    if (!email || !ticketInfo || !phone) {
      return res.status(400).json({
        message: "Email, phone, and ticket information are required.",
      });
    }

    // Save the booking details in MongoDB
    const booking = new BookingModel({
      email,
      phone,
      paymentType,
      ticketInfo,
    });
    await booking.save();

    // Generate a QR code for the ticket
    const qrCodeData = await QRCode.toDataURL(
      `${ticketInfo.movieName} - ${ticketInfo.seat} - ${ticketInfo.date} - ${ticketInfo.time}`
    );

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.PASS_MAIL,
        pass: process.env.PASS_KEY,
      },
    });

    // Define the email content
    const mailOptions = {
      from: process.env.PASS_MAIL,
      to: email,
      subject: "Your Movie Ticket",
      html: `
        <h3>Your Movie Ticket</h3>
        <p>Thank you for booking with us. Here are your ticket details:</p>
        <p><strong>Movie:</strong> ${ticketInfo.movieName}</p>
        <p><strong>Seats:</strong> ${ticketInfo.seats.join(", ")}</p>
        <p><strong>Date:</strong> ${ticketInfo.date}</p>
        <p><strong>Time:</strong> ${ticketInfo.time}</p>
        <p><strong>Total Price:</strong> $${ticketInfo.totalPrice}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Payment Type:</strong> ${paymentType}</p>
        <p>Show this email at the entrance to access your movie.</p>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).json({
          message: "Failed to send ticket email",
          error: error.message,
        });
      } else {
        return res
          .status(200)
          .json({ message: "Ticket email sent successfully", booking });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// data getting by email
export const bookingData = async (req, res) => {
  try {
    const email = req.params.email; // Extract email from route parameters

    // Fetch bookings where email matches
    const data = await BookingModel.find({ email });

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this email" });
    }

    // Return the booking data
    return res.status(200).json({ message: "Data found", data });
  } catch (error) {
    console.error("Error fetching booking data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//data deleting

export const deleteBooking = async (req, res) => {
  try {
    const { bookingId, email } = req.params; // Extract bookingId and email from request parameters

    // Find and delete the booking
    const booking = await BookingModel.findOneAndDelete({
      _id: bookingId,
      email,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or does not match the email" });
    }

    return res.status(200).json({
      message: "Booking successfully deleted",
      deletedBooking: booking,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

// Create Razorpay Order
export const createOrder = async (req, res) => {
  const { amount, currency } = req.body;

  // Input validation
  if (!amount || !currency || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount or currency",
    });
  }

  try {
    const options = {
      amount: amount,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    console.log("Order created successfully:", order);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error in createOrder:", error); // Log the full error
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.response || error.message || error, // Provide detailed error
    });
  }
};

//getmovie

export const fetchMovieFromOMDB = async (req, res) => {
  const { id } = req.params;

  // Use API key from the environment variables
  const OMDB_API_KEY = process.env.OMDB_API_KEY; // The API key is stored in .env file
  if (!OMDB_API_KEY) {
    return res.status(500).json({ message: "OMDB API key is not defined." });
  }

  const OMDB_URL = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`;

  try {
    // Make a GET request to OMDB API
    const response = await axios.get(OMDB_URL);

    // Check if the response from OMDB is valid
    if (response.data.Response === "False") {
      return res.status(404).json({ message: response.data.Error });
    }

    // Send the movie data back to the client
    res.json(response.data);
  } catch (error) {
    // Log the error details to help debug
    console.error("Error fetching from OMDB:", error);

    // Return a detailed error message to the client
    res.status(500).json({
      message: "Error fetching movie from OMDB",
      error: error.response ? error.response.data : error.message,
    });
  }
};

//Theater update

export const createTheater = async (req, res) => {
  const { name, showTimes, price } = req.body;

  try {
    // Check if a theater with the same name already exists
    const existingTheater = await Theater.findOne({ name });
    if (existingTheater) {
      return res
        .status(400)
        .json({ message: "Theater with this name already exists" });
    }

    // Create a new theater document
    const newTheater = new Theater({
      name,
      showTimes,
      price,
    });

    // Save the new theater
    await newTheater.save();

    res.status(201).json({
      message: "Theater created successfully",
      data: newTheater,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update theater information
export const updateTheaterInfo = async (req, res) => {
  const { theaterId, name, showTimes, price } = req.body;

  try {
    // Find the theater by its ID and update the information
    const updatedTheater = await Theater.findByIdAndUpdate(
      theaterId,
      { name, showTimes, price },
      { new: true }
    );

    if (!updatedTheater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    res.status(200).json({
      message: "Theater information updated successfully",
      data: updatedTheater,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all theater info

export const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json(theaters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
