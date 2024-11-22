import express from "express";
import {
  loginUser,
  registerUser,
  saveBookingAndSendEmail,
  bookingData,
  deleteBooking,
  createOrder,
  createTheater,
  updateTheaterInfo,
  getAllTheaters,
  fetchMovieFromOMDB,
} from "../Controllers/authController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/book-ticket", saveBookingAndSendEmail);

router.get("/history/:email", bookingData);

router.delete("/bookings/:email/:bookingId", deleteBooking);

router.post("/createpayment", createOrder);
router.post("/createtheater", authMiddleware, createTheater);

router.put("/updatetheater", authMiddleware, updateTheaterInfo);

router.get("/gettheater", getAllTheaters);

router.get("/movie/:id", fetchMovieFromOMDB);

export default router;
