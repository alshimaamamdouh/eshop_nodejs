const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const sendEmail = require('../email/emailservice');



// Update order status
router.put('/updateStatus', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Validate input
    if (!orderId || !status) {
      return res.status(400).json({ message: 'Order ID and status are required' });
    }

    // Validate the status
    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the order and update its status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Send confirmation email
    const { email } = req.body; // Email of the user placing the order
    const subject = 'Order Confirmation';
    const text = `Thank you for your order. Your order number is ${order.orderNumber}.`;
    const html = `<p>Thank you for your order. Your order number is <strong>${order.orderNumber}</strong>.</p>`;
    
    await sendEmail(email, subject, text, html);
    
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get orders by user ID
router.post('/getByUser', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('userId received:', userId);

    // Find orders by userId
    const orders = await Order.find({ userId });
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
    // Fetch all orders
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete an order
router.delete('/:orderId', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) return res.status(404).send('Order not found');
    res.status(200).send('Order deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
