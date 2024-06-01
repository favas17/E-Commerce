const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const session = require('express-session');
const mongoose = require('mongoose'); // Ensure mongoose is required
const connectDB = require('../E-Commerce/utilities/db');
const path = require('path');
const userRoutes = require('./router/userRoutes');
const adminRoutes = require('./router/adminRoutes');

const PORT = process.env.PORT || 9898;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(session({
  secret: '111',
  resave: false,
  saveUninitialized: true,
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', userRoutes);
app.use('/', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}).on('error', (err) => {
  console.error(`Error starting server: ${err.message}`);
});
