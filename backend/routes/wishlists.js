const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');

// Add a product to the wishlist
router.post('/add', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // find the product to ensure it exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // find or create the wishlist by user
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if the product already exists in the wishlist
    const existingProduct = wishlist.products.find(item => item.productId.equals(productId));
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add the product to the wishlist
    wishlist.products.push({ productId });

    // Save the wishlist
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a product from the wishlist
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // find the wishlist for the user
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    // remove the product from the wishlist
    wishlist.products = wishlist.products.filter(item => !item.productId.equals(productId));

    // Save the wishlist
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear the wishlist
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // find the wishlist for the user
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    // clear all products from the wishlist
    wishlist.products = [];

    // Save the wishlist with an empty product list
    await wishlist.save();
    res.status(200).json({ message: 'Wishlist cleared successfully', wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products in the wishlist by user ID 
router.post('/items', async (req, res) => {
  try {
    const { userId } = req.body;

    const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
