import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  email: { type: String,
     required: true
     },

  phone: { type: String,
     required: true 
    },

  paymentType: { type: String,
     required: true 
    },

  ticketInfo: {
    movieName: { type: String, 
      required: true 
    },

    seats: { type: [String],
       required: true 
      },

    date: { type: String, 
      required: true 
    },

    time: { type: String, 
      required: true 
    },
    
    totalPrice: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
});

const BookingModel = mongoose.model("Booking", bookingSchema);

export default BookingModel;
