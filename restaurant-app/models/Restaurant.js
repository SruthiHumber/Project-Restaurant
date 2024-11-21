const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Restaurant Schema
const RestaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  borough: {
    type: String,
    required: false,
  },
  cuisine: {
    type: String,
    required: true,
  },
  address: {
    building: {
      type: String,
      required: false,
    },
    street: {
      type: String,
      required: false,
    },
    zipcode: {
      type: String,
      required: false,
    },
    coord: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
  },
  grades: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      grade: {
        type: String,
        required: false,
      },
      score: {
        type: Number,
        required: false,
      },
    },
  ],
  restaurant_id: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create and export the Restaurant model
module.exports = mongoose.model('Restaurant', RestaurantSchema);
