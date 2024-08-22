const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Product = require('../models/product');
const User = require('../models/user');

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('product').populate('user');
    res.send(reviews);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get a review by ID
router.get('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate('product').populate('user');
    if (!review) return res.status(404).send('Review not found');
    res.send(review);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get all reviews by a certain user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId }).populate('product');
    if (reviews.length === 0) return res.status(404).send('No reviews found for this user');
    res.send(reviews);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get all reviews for a certain product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user');
    if (reviews.length === 0) return res.status(404).send('No reviews found for this product');
    res.send(reviews);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Create a review
router.post('/', async (req, res) => {
  try {
    const { text, rating, productId, userId } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) return res.status(400).send('Rating must be between 1 and 5');

    // Validate product and user
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    const review = new Review({ text, rating, product: productId, user: userId });
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update a review
router.put('/:reviewId', async (req, res) => {
  try {
    const { text, rating } = req.body;

    if (rating < 1 || rating > 5) return res.status(400).send('Rating must be between 1 and 5');

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { text, rating },
      { new: true }
    ).populate('product').populate('user');

    if (!review) return res.status(404).send('Review not found');
    res.send(review);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.status(404).send('Review not found');
    res.send('Review deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
