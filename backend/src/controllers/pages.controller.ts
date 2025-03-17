import { Request, Response } from 'express';
import Page from '../models/Page';
import mongoose from 'mongoose';
import { IUser } from '../models/User';
import { body, validationResult } from 'express-validator';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Validation middleware for page
export const validatePage = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('customSlug').optional().isString(),
];

// Create new page
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, content, status, featuredImage, layout, order, parent, seo, customSlug } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to create pages' });
    }
    
    // Generate slug from title or use custom slug
    const slug = customSlug || title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: 'A page with this slug already exists' });
    }
    
    // Create new page
    const page = new Page({
      title,
      slug,
      content,
      status,
      author: req.user._id,
      featuredImage,
      layout,
      order,
      parent,
      seo,
    });
    
    await page.save();
    
    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all pages
export const getAllPages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Execute query with pagination
    const pages = await Page.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Page.countDocuments(query);
    
    res.json({
      pages,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get page by ID
export const getPageById = async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id).populate('author', 'name email');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get page by slug
export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug }).populate('author', 'name email');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update page
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, content, status, featuredImage, layout, order, parent, seo, customSlug } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to update pages' });
    }
    
    // Find page by ID
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Update slug if customSlug is provided or title has changed
    let slug = page.slug;
    if (customSlug) {
      slug = customSlug;
    } else if (title && title !== page.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Check if new slug already exists (except for the current page)
    if (slug !== page.slug) {
      const existingPage = await Page.findOne({ slug, _id: { $ne: page._id } });
      if (existingPage) {
        return res.status(400).json({ message: 'A page with this slug already exists' });
      }
    }
    
    // Update page
    page.title = title || page.title;
    page.slug = slug;
    page.content = content || page.content;
    page.status = status || page.status;
    page.featuredImage = featuredImage || page.featuredImage;
    page.layout = layout || page.layout;
    page.order = order !== undefined ? order : page.order;
    page.parent = parent || page.parent;
    
    if (seo) {
      page.seo = {
        ...page.seo,
        ...seo,
      };
    }
    
    await page.save();
    
    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete page
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to delete pages' });
    }
    
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    await Page.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 