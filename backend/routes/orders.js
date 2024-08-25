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

// Get order by ID using POST
router.post('/getOrderById', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('orderItems');
    if (!order) return res.status(404).send('Order not found');
    res.send(order);
  } catch (error) {
    res.status(500).send('Server error');
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
