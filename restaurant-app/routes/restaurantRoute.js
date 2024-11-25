const express = require('express');
const db = require('../services/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');


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

router.get('/export/csv', async (req, res) => {
    try {
        // Fetch restaurant data
        const restaurants = await db.getAllRestaurants();

        // Define CSV headers
        const csvWriter = createObjectCsvWriter({
            path: 'restaurants.csv', // Temporary file
            header: [
                { id: 'name', title: 'Name' },
                { id: 'borough', title: 'Borough' },
                { id: 'cuisine', title: 'Cuisine' },
                { id: 'address.building', title: 'Building' },
                { id: 'address.street', title: 'Street' },
                { id: 'zipcode', title: 'Zipcode' },
                { id: 'longitude', title: 'Longitude' },
                { id: 'latitude', title: 'Latitude' },
                { id: 'grades', title: 'Grades' },
            ],
        });

        // Map restaurant data to CSV format
        
        const csvData = restaurants.map(({
            name = 'N/A',
            borough = 'N/A',
            cuisine = 'N/A',
            address: {
                building = 'N/A',
                street = 'N/A',
                zipcode = 'N/A',
                coord = [null, null]
            } = {}, // Default to an empty object for address
            grades = []
        }) => ({
            name,
            borough,
            cuisine,
            building,
            street,
            zipcode,
            longitude: coord[0] || 'N/A',
            latitude: coord[1] || 'N/A',
            grades: grades.length
                ? grades
                      .map(({ date, grade, score }) => {
                          if (!date || !grade || !score) return 'N/A';
                          return `Date: ${new Date(date).toLocaleDateString()}, Grade: ${grade}, Score: ${score}`;
                      })
                      .join(' | ')
                : 'N/A'
        }));

        // Write CSV file
        await csvWriter.writeRecords(csvData);

        // Send the file as a response
        res.download(path.join(__dirname, '../restaurants.csv'), 'restaurants.csv', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error generating CSV');
            } else {
                // Delete the file after sending it
                fs.unlinkSync('restaurants.csv');
            }
        });
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        res.status(500).send('Error exporting to CSV');
    }
});


router.get('/export/pdf', async (req, res) => {
    try {
        // Fetch restaurant data
        const restaurants = await db.getAllRestaurants();

        // Create a PDF document
        const doc = new PDFDocument();
        const fileName = 'restaurants.pdf';

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(18).text('Restaurant List', { align: 'center', underline: true });
        doc.moveDown();

        // Add restaurant details
        restaurants.forEach((restaurant, index) => {
            doc
                .fontSize(14)
                .text(`${index + 1}. Name: ${restaurant.name}`, { align: 'left', continued: true })
                .text(` | Borough: ${restaurant.borough}`, { align: 'left' });
            doc.text(`Cuisine: ${restaurant.cuisine}`);
            doc.text(`Address: ${restaurant.address?.building || ''}, ${restaurant.address?.street || ''}, ${restaurant.address?.zipcode || ''}`);
            doc.text(
                `Coordinates: Longitude: ${restaurant.address?.coord?.[0] || 'N/A'}, Latitude: ${restaurant.address?.coord?.[1] || 'N/A'}`
            );

            if (restaurant.grades && restaurant.grades.length > 0) {
                doc.text('Grades:', { underline: true });
                restaurant.grades.forEach((grade) => {
                    doc.text(
                        `- Date: ${new Date(grade.date).toLocaleDateString()}, Grade: ${grade.grade}, Score: ${grade.score}`
                    );
                });
            } else {
                doc.text('Grades: N/A');
            }

            doc.moveDown(); // Add spacing between restaurants
        });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).send('Error exporting to PDF');
    }
});



module.exports = router;
