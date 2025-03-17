import { Request, Response } from 'express';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { IUser } from '../models/User';
import { body, validationResult } from 'express-validator';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Validation middleware for product
export const validateProduct = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('categories').isArray().optional(),
  body('tags').isArray().optional(),
  body('customSlug').optional().isString(),
];

// Create new product
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      title, description, shortDescription, price, salePrice, sku, status, 
      categories, tags, featuredImage, galleryImages, inStock, 
      stockQuantity, attributes, seo, customSlug 
    } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to create products' });
    }
    
    // Generate slug from title or use custom slug
    const slug = customSlug || title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this slug already exists' });
    }
    
    // Check if SKU already exists
    const existingProductSku = await Product.findOne({ sku });
    if (existingProductSku) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }
    
    // Create new product
    const product = new Product({
      title,
      slug,
      description,
      shortDescription,
      price,
      salePrice,
      sku,
      status,
      categories: categories || [],
      tags: tags || [],
      author: req.user._id,
      featuredImage,
      galleryImages,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity,
      attributes,
      seo,
    });
    
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, category, tag, inStock, minPrice, maxPrice } = req.query;
    
    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add category filter if provided
    if (category) {
      query.categories = category;
    }
    
    // Add tag filter if provided
    if (tag) {
      query.tags = tag;
    }
    
    // Add inStock filter if provided
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    
    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, inStock, minPrice, maxPrice } = req.query;
    const { category } = req.params;
    
    const query: any = {
      categories: category,
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    } else {
      // By default, only show published products
      query.status = 'published';
    }
    
    // Add inStock filter if provided
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    
    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by tag
export const getProductsByTag = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, inStock, minPrice, maxPrice } = req.query;
    const { tag } = req.params;
    
    const query: any = {
      tags: tag,
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    } else {
      // By default, only show published products
      query.status = 'published';
    }
    
    // Add inStock filter if provided
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    
    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching products by tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('author', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by slug
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('author', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      title, description, shortDescription, price, salePrice, sku, status, 
      categories, tags, featuredImage, galleryImages, inStock, 
      stockQuantity, attributes, seo, customSlug 
    } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to update products' });
    }
    
    // Find product by ID
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update slug if customSlug is provided or title has changed
    let slug = product.slug;
    if (customSlug) {
      slug = customSlug;
    } else if (title && title !== product.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Check if new slug already exists (except for the current product)
    if (slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (existingProduct) {
        return res.status(400).json({ message: 'A product with this slug already exists' });
      }
    }
    
    // Check if new SKU already exists (except for the current product)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku, _id: { $ne: product._id } });
      if (existingProduct) {
        return res.status(400).json({ message: 'A product with this SKU already exists' });
      }
    }
    
    // Update product
    product.title = title || product.title;
    product.slug = slug;
    product.description = description || product.description;
    product.shortDescription = shortDescription || product.shortDescription;
    product.price = price !== undefined ? price : product.price;
    product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;
    product.sku = sku || product.sku;
    product.status = status || product.status;
    product.categories = categories || product.categories;
    product.tags = tags || product.tags;
    product.featuredImage = featuredImage || product.featuredImage;
    product.galleryImages = galleryImages || product.galleryImages;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    
    if (attributes) {
      product.attributes = new Map(Object.entries(attributes));
    }
    
    if (seo) {
      product.seo = {
        ...product.seo,
        ...seo,
      };
    }
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to delete products' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 