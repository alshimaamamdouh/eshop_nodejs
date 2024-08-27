const express = require('express');
const router = express.Router();
const sendEmail = require('../email/emailservice');

// Handle "Contact Us" form submission
router.post('/email', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const subject = 'Contact Us Form Submission';
    const text = `Message from ${name} (${email}): ${message}`;
    const html = `<p><strong>Message from ${name} (${email})</strong>: ${message}</p>`;

    // Send contact email
    await sendEmail('booking.online.alx@gmail.com', subject, text, html);

    res.status(200).json({ message: 'Your message has been sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
