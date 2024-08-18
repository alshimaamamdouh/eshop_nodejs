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

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = new Product({ name, description, price, category });
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update a product
router.put('/:productId', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { name, description, price, category },
      { new: true }
    );
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (error) {
    res.status(500).send('Server error');
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
