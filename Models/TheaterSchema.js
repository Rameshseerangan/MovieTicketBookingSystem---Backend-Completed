import mongoose from "mongoose";
const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, 
  },
  showTimes: [
    {
      type: String,
      required: true,
    },
  ],

  price: {
    type: Number,
    required: true,
  },
});

const Theater = mongoose.model("Theater", theaterSchema);

export default Theater;
