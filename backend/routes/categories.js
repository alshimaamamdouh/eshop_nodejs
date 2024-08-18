const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Create a new category
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a category
router.delete('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);
    if (!category) return res.status(404).send('Category not found');
    res.send('Category deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
