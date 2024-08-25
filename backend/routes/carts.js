const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');


// Add an item to the cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Find the product to get its price and discount
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const discountedPrice = product.discount > 0 
      ? product.price - (product.price * product.discount / 100) 
      : product.price;

    // Find or create the cart by user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ 
        productId, 
        quantity, 
        price: product.price, 
        discountedPrice,      
      });
    }

    // Save the cart and calculate the total price
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// reduce quantity of certain item from the cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Find the item in the cart
    const item = cart.items.find(item => item.productId.equals(productId));
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    // Find the product to get its price and discount information
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Calculate the effective price considering any discount
    const effectivePrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

    // Reduce the quantity or remove the item if the quantity reaches 0
    if (quantity >= item.quantity) {
      // Remove the item from the cart if quantity is greater than or equal to existing quantity
      cart.items = cart.items.filter(item => !item.productId.equals(productId));
    } else {
      // Reduce the quantity and adjust the price
      item.quantity -= quantity;
    }

    // Recalculate the total price of the cart
    let newTotalPrice = 0;
    for (let item of cart.items) {
      const itemProduct = await Product.findById(item.productId);
      const itemEffectivePrice = itemProduct.discount > 0 ? itemProduct.price * (1 - itemProduct.discount / 100) : itemProduct.price;
      newTotalPrice += itemEffectivePrice * item.quantity;
    }
    cart.totalPrice = newTotalPrice;

    // Save the updated cart
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete item from the cart
router.delete('/removeitem', async (req, res) => {
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
