const mongoose = require('mongoose');

let Restaurant;

const initialize = async (connectionString) => {
    try {
        await mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas");
        const restaurantSchema = new mongoose.Schema({
            name: String,
            borough: String,
            cuisine: String,
            restaurant_id: String,
        });
        Restaurant = mongoose.model('Restaurant', restaurantSchema);
    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw err;
    }
};

const addNewRestaurant = async (data) => await new Restaurant(data).save();

const getAllRestaurants = async (page, perPage, borough) => {
    const filter = borough ? { borough } : {};
    return await Restaurant.find(filter)
        .sort({ restaurant_id: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage);
};

async function getRestaurantCount() {
  return Restaurant.countDocuments();
}

async function getRestaurantCountByBorough(borough) {
  return Restaurant.countDocuments({ borough });
}

const getRestaurantById = async (id) => await Restaurant.findById(id);

const updateRestaurantById = async (id, data) => await Restaurant.findByIdAndUpdate(id, data, { new: true });

const deleteRestaurantById = async (id) => await Restaurant.findByIdAndDelete(id);

module.exports = {
    initialize,
    addNewRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurantById,
    deleteRestaurantById,
    getRestaurantCount,
    getRestaurantCountByBorough
};
