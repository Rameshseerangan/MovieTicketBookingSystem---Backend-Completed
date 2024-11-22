import Razorpay from "razorpay";
import dotenv from "dotenv";


dotenv.config();

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Load from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Load from .env
});

// Verify credentials by creating a dummy order
(async () => {
  try {
    const options = {
      amount: 100, // 100 paise = 1 INR
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    console.log(
      "Razorpay credentials verified successfully. Order created:",
      order
    );
  } catch (error) {
    console.error(
      "Razorpay credentials verification failed:",
      error.message || error
    );
  }
})();

export default razorpayInstance;
