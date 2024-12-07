require('dotenv').config();
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');
const exphbs = require('express-handlebars');
const restaurantRoutes = require('./routes/restaurantRoute');
const userRoutes = require('./routes/userRoute');
const db = require('./services/database');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');





const app = express();
const PORT = process.env.PORT || 3000;
// Handlebars setup with custom helpers
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        gt: (a, b) => a > b,             // Greater-than helper
        lt: (a, b) => a < b,             // Less-than helper
        eq: (a, b) => a === b,           // Equal helper
        add: (a, b) => a + b,            // Add helper
        subtract: (a, b) => a - b,       // Subtract helper
        range: (start, end) => {         // Range helper for pagination
            const range = [];
            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        },
    },
});
// Set Handlebars as the view engine
app.engine('hbs',  hbs.engine);
app.set('view engine', 'hbs');

// Set the views directory (make sure this points to your views folder)
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true, // Allow cookies to be sent
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true for HTTPS
    })
);
app.use(methodOverride('_method'));
app.use(express.static('public')); // Serve static files from the "public" directory
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline';"
    );
    next();
});



app.get('/register', (req, res) => {
    res.render('register', { title: 'Login' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.use(methodOverride('_method', {
    methods: ['POST'] // Only override POST requests
}));

app.use((req, res, next) => {
    console.log('Overridden Method:', req.method); // Should show PUT or DELETE after override
    next();
});
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/auth', userRoutes);
// Routes
app.get('/form', async(req, res) => {
    res.redirect('/api/restaurants');
});

app.get('/add-restaurant', (req, res) => {
    res.render('addRestaurant');
});


// Initialize DB and Start Server
db.initialize(process.env.DB_CONNECTION_STRING)
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => console.error("Failed to initialize database:", err));
