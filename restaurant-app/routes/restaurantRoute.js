const express = require('express');
const db = require('../services/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Add new restaurant
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newRestaurant = await db.addNewRestaurant(req.body);
        res.status(201).json(newRestaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    const { page = 1, perPage = 5, borough } = req.query; // Default page = 1, perPage = 5
    try {
        // Fetch restaurants based on pagination and optional borough filter
        const restaurants = await db.getAllRestaurants(Number(page), Number(perPage), borough);
        

        // Total count for pagination (optional if you want total pages displayed in UI)
        const totalRestaurants = borough
            ? await db.getRestaurantCountByBorough(borough)
            : await db.getRestaurantCount();

        const totalPages = Math.ceil(totalRestaurants / perPage);

        console.log('Fetched Restaurants:', restaurants);
console.log('Current Page:', page);
console.log('Total Pages:', totalPages);

        // Render the page
        res.render('form', {
            restaurants,
            currentPage: Number(page),
            totalPages,
            perPage,
            borough
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await db.getRestaurantById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update restaurant by ID
router.put('/:id',authMiddleware, async (req, res) => {
    try {
        console.log("*********");
        
        const updatedRestaurant = await db.updateRestaurantById(req.params.id, req.body);
        console.log("update", updatedRestaurant)
        res.json(updatedRestaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete restaurant by ID
router.delete('/:id', async (req, res) => {
    try {
        await db.deleteRestaurantById(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
