const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get a product by ID
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).send('Category not found');

    const products = await Product.find({ category: req.params.categoryId });
    res.send(products);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Search products by title or description using POST request
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body; // Extract the search query from the request body
    if (!query) return res.status(400).json({ message: 'Search query is required' });

    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





// Create a new product
router.post('/', async (req, res) => {
  try {
    
    const product = new Product(req.body);
    //const product = new Product({ title, description, richDescription, rating, brand, price, category });
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update a product
router.put('/:productId', async (req, res) => {
  try {
    const { title, description, richDescription, rating, image, brand, price, category } = req.body;

    // Find and update the product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: { title, description, richDescription, rating, image, brand, price, category } },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete a product
router.delete('/:productId', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) return res.status(404).send('Product not found');
    res.send('Product deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
