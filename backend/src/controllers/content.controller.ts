import { Request, Response } from 'express';
import Content from '../models/Content';
import mongoose from 'mongoose';
import { IUser } from '../models/User';
import { body, validationResult } from 'express-validator';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Validation middleware for content
export const validateContent = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('contentType').isIn(['post', 'page', 'custom']).withMessage('Invalid content type'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('categories').isArray().optional(),
  body('tags').isArray().optional(),
  body('customSlug').optional().isString(),
];

// Create new content
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, content, contentType, status, categories, tags, metadata, featuredImage, customSlug } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (editor or admin)
    if (!['editor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to create content' });
    }
    
    // Generate slug from title or use custom slug
    const slug = customSlug || title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const existingContent = await Content.findOne({ slug });
    if (existingContent) {
      return res.status(400).json({ message: 'Content with this title/slug already exists' });
    }
    
    const newContent = new Content({
      title,
      slug,
      content,
      contentType: contentType || 'post',
      status: status || 'draft',
      author: req.user._id,
      categories: categories || [],
      tags: tags || [],
      metadata: metadata || {},
      featuredImage,
    });
    
    const savedContent = await newContent.save();
    
    res.status(201).json(savedContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Error creating content', error });
  }
};

// Get all content with pagination and filtering
export const getAllContent = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      contentType, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter object
    const filter: any = {};
    
    if (contentType) filter.contentType = contentType;
    if (status) filter.status = status;
    
    // Add text search if provided
    if (search) {
      filter.$text = { $search: search as string };
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const contents = await Content.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('author', 'username email');
    
    const total = await Content.countDocuments(filter);
    
    res.status(200).json({
      contents,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content', error });
  }
};

// Get content by ID
export const getContentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    const content = await Content.findById(id).populate('author', 'username email');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.status(200).json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content', error });
  }
};

// Get content by slug
export const getContentBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const content = await Content.findOne({ slug }).populate('author', 'username email');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.status(200).json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content', error });
  }
};

// Update content
export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { title, content, contentType, status, categories, tags, metadata, featuredImage, customSlug } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    const existingContent = await Content.findById(id);
    
    if (!existingContent) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user is author or has required role
    const isAuthor = existingContent.author.toString() === req.user._id.toString();
    const hasPermission = ['editor', 'admin'].includes(req.user.role);
    
    if (!isAuthor && !hasPermission) {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }
    
    // Determine slug - use custom slug, keep existing, or generate from new title
    let slug = existingContent.slug;
    
    if (customSlug) {
      // Use provided custom slug
      slug = customSlug;
    } else if (title && title !== existingContent.title) {
      // Generate new slug from title
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Check if new slug already exists (excluding current content)
    if (slug !== existingContent.slug) {
      const slugExists = await Content.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Content with this title/slug already exists' });
      }
    }
    
    const updatedContent = await Content.findByIdAndUpdate(
      id,
      {
        title: title || existingContent.title,
        slug,
        content: content || existingContent.content,
        contentType: contentType || existingContent.contentType,
        status: status || existingContent.status,
        categories: categories || existingContent.categories,
        tags: tags || existingContent.tags,
        metadata: metadata || existingContent.metadata,
        featuredImage: featuredImage || existingContent.featuredImage,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('author', 'username email');
    
    res.status(200).json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Error updating content', error });
  }
};

// Delete content
export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    const content = await Content.findById(id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user is author or has required role
    const isAuthor = content.author.toString() === req.user._id.toString();
    const hasPermission = ['editor', 'admin'].includes(req.user.role);
    
    if (!isAuthor && !hasPermission) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }
    
    await Content.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Error deleting content', error });
  }
}; 