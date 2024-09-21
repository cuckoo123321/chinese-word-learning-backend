const express = require('express');
const router = express.Router();
const carouselRoutes = require('./api/carouselData');
const productRoutes = require('./api/productData');
const articleRoutes = require('./api/articleData');
const userRoutes = require('./api/userData');
const favoriteRoutes = require('./api/favoriteData');

router.use('/api/carouselData', carouselRoutes);
router.use('/api/productData', productRoutes);
router.use('/api/articleData', articleRoutes);
router.use('/api/userData', userRoutes);
router.use('/api/favoriteData', favoriteRoutes);

module.exports = router;
