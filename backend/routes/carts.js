// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Product = require('../models/product');

// Get cart for a user
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate({
      path: 'items',
      populate: {
        path: 'product'
      }
    });
    if (!cart) return res.status(404).send('Cart not found');
    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Add item to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) return res.status(400).send('Quantity must be at least 1');

    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    let cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) {
      cart = new Cart({ user: req.params.userId, items: [] });
    }

    let cartItem = await CartItem.findOne({ product: productId });
    if (!cartItem) {
      cartItem = new CartItem({ product: productId, quantity });
      await cartItem.save();
    } else {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    if (!cart.items.includes(cartItem._id)) {
      cart.items.push(cartItem._id);
      await cart.save();
    }

    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Remove item from cart
router.post('/:userId/remove', async (req, res) => {
  try {
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) return res.status(404).send('Cart not found');

    const cartItem = await CartItem.findOneAndDelete({ product: productId });
    if (!cartItem) return res.status(404).send('Cart item not found');

    cart.items = cart.items.filter(itemId => !itemId.equals(cartItem._id));
    await cart.save();
    
    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update item quantity in cart
router.post('/:userId/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) return res.status(400).send('Quantity must be at least 1');

    let cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) return res.status(404).send('Cart not found');

    let cartItem = await CartItem.findOne({ product: productId });

    if (!cartItem) return res.status(404).send('Cart item not found');

    cartItem.quantity = quantity;
    await cartItem.save();

    res.send(cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
