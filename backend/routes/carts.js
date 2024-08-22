const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// Add an item to the cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Find the product to get its details
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    // Find or create the cart for the user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Remove an item from the cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).send('Cart not found');

    // Remove the item from the cart
    cart.items = cart.items.filter(item => !item.productId.equals(productId));

    await cart.save();
    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get all items in the cart
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) return res.status(404).send('Cart not found');

    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
