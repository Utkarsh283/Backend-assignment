const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config(
    { path: "./.env" }
);

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Enable CORS (Cross-Origin Resource Sharing) with credentials support
app.use(cors({
    origin: process.env.CLIENT_URL,  
    credentials: true                
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Global error handler (simple)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
    console.error('Error: MONGO_URI not specified in environment');
    process.exit(1);
}
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
