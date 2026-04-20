// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cors = require('cors');

const app = express();

const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowNetlifyPreviews = process.env.ALLOW_NETLIFY_PREVIEWS === 'true';

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header) like health checks.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (allowNetlifyPreviews && origin.endsWith('.netlify.app')) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

module.exports = app;