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


// Get paginated products with POST
router.post('/pagination', async (req, res) => {
  try {
    // Get page and limit from the request body, with defaults
    const { page = 1, limit = 10 } = req.body;

    // Calculate the number of products to end
    const end = (page - 1) * limit;

    // Fetch the products with pagination
    const products = await Product.find().skip(end).limit(limit);

    // Get the total number of products
    const totalProducts = await Product.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

// Get products by category with pagination
router.post('/category/:categoryId/pagination', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.body;

    // Validate category
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).send('Category not found');

    // Calculate the number of products to skip
    const end = (page - 1) * limit;

    // Fetch the products with pagination
    const products = await Product.find({ category: categoryId }).skip(end).limit(limit);

    // Get the total number of products
    const totalProducts = await Product.countDocuments({ category: categoryId });

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      page,
      totalPages,
      totalProducts,
    });
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
    res.status(500).json({ message: 'Server error' });
  }
});


// Search products by title or description with pagination
router.post('/search/pagination', async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.body;
    if (!query) return res.status(400).json({ message: 'Search query is required' });

    // Calculate the number of products to skip
    const end = (page - 1) * limit;

    // Search products with pagination
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).skip(end).limit(limit);

    // Get the total number of products matching the query
    const totalProducts = await Product.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json({
      products,
      page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Get products by rating
router.get('/rating/:minRating', async (req, res) => {
  try {
    const minRating = parseFloat(req.params.minRating);

    if (isNaN(minRating)) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    // Log the minRating value
    console.log(`Filtering products with rating >= ${minRating}`);

    // Find products with rating greater than or equal to minRating
    const products = await Product.find({ rating: { $gte: minRating } });

    // Log the products found
    console.log(`Found ${products.length} products with rating >= ${minRating}`);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found with the specified rating' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Search products by rating with pagination
router.post('/rating/pagination', async (req, res) => {
  try {
    const { minRating, page = 1, limit = 10 } = req.body;
    
    if (isNaN(minRating)) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    // Calculate the number of products to skip
    const end = (page - 1) * limit;

    // Search products with rating greater than or equal to minRating and apply pagination
    const products = await Product.find({ rating: { $gte: parseFloat(minRating) } }).skip(end).limit(limit);

    // Get the total number of products matching the rating criteria
    const totalProducts = await Product.countDocuments({ rating: { $gte: parseFloat(minRating) } });

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found with the specified rating' });
    }

    res.status(200).json({
      products,
      page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// POST to get products that have discount
router.post('/discounted', async (req, res) => {
  try {
    const discountedProducts = await Product.find({ discount: { $gt: 0 } });
    if (discountedProducts.length === 0) {
      return res.status(404).json({ message: 'No discounted products found' });
    }
    res.json(discountedProducts);
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get discounted products with pagination
router.post('/discounted/pagination', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    
    
    const end = (page - 1) * limit;

    // Find discounted products and apply pagination
    const discountedProducts = await Product.find({ discount: { $gt: 0 } }).skip(end).limit(limit);

    // Get the total number of discounted products
    const totalDiscountedProducts = await Product.countDocuments({ discount: { $gt: 0 } });

    // Calculate total pages
    const totalPages = Math.ceil(totalDiscountedProducts / limit);

    if (discountedProducts.length === 0) {
      return res.status(404).json({ message: 'No discounted products found' });
    }

    res.status(200).json({
      products: discountedProducts,
      page,
      totalPages,
      totalDiscountedProducts,
    });
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    res.status(500).json({ message: 'Server error' });
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
    const { title, description, richDescription, rating, image, brand, discount, price, category } = req.body;

    // Find and update the product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: { title, description, richDescription, rating, image, brand, discount, price, category } },
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
