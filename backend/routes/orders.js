const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/getByuser', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('userId received:', userId);

    const orders = await Order.find({ userId }).populate('orderItems');
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});







// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('orderItems');
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete an order
router.delete('/:orderId', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) return res.status(404).send('Order not found');
    res.send('Order deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
