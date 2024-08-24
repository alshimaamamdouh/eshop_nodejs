const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// Add an item to the cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // find the product to get its price and discount
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Calculate the discounted price if a discount exists
    const discount = product.discount || 0;
    const priceAfterDiscount = product.price * ((100 - discount) / 100);

    // find or create the cart by user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = priceAfterDiscount; 
    } else {
      cart.items.push({ 
        productId, 
        quantity, 
        price: priceAfterDiscount 
      });
    }

    // Save the cart and calculate the total price with discount
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item from the cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // find the cart for the user
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // remove the item from the cart
    cart.items = cart.items.filter(item => !item.productId.equals(productId));

    // save the cart and calculate the total price
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all items in the cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // find the cart for the user
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // clear all items from the cart
    cart.items = [];

    // save the cart with an empty item list
    await cart.save();
    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all items in the cart
router.post('/items', async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
