import { Request, Response } from 'express';
import Post from '../models/Post';
import mongoose from 'mongoose';
import { IUser } from '../models/User';
import { body, validationResult } from 'express-validator';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Validation middleware for post
export const validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('slug').optional().isString(),
  body('customSlug').optional().isString(),
];

// Create new post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, content, status, featuredImage, categories, tags, publishDate, seo, customSlug, slug } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to create posts' });
    }
    
    // Use provided slug, fall back to customSlug, or generate from title
    const finalSlug = slug || customSlug || title
      .toLowerCase()
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // Clean up extra hyphens at start/end
    
    // Check if slug already exists
    const existingPost = await Post.findOne({ slug: finalSlug });
    if (existingPost) {
      return res.status(400).json({ message: 'A post with this slug already exists' });
    }
    
    // Create new post
    const post = new Post({
      title,
      slug: finalSlug,
      content,
      status,
      author: req.user._id,
      featuredImage,
      categories,
      tags,
      publishDate,
      seo,
    });
    
    await post.save();
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, category, tag } = req.query;
    
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
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ publishDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get posts by category
export const getPostsByCategory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { category } = req.params;
    
    const query: any = {
      categories: category,
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    } else {
      // By default, only show published posts
      query.status = 'published';
    }
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ publishDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get posts by tag
export const getPostsByTag = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { tag } = req.params;
    
    const query: any = {
      tags: tag,
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    } else {
      // By default, only show published posts
      query.status = 'published';
    }
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ publishDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author', 'name email');
    
    // Get total count
    const count = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get post by slug
export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update post
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, content, status, featuredImage, categories, tags, publishDate, seo, customSlug, slug } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to update posts' });
    }
    
    // Find post by ID
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Determine new slug
    let finalSlug = post.slug;
    
    // If slug is explicitly provided, use it
    if (slug !== undefined) {
      finalSlug = slug;
    } 
    // Otherwise check for customSlug (backward compatibility)
    else if (customSlug) {
      finalSlug = customSlug;
    } 
    // If title changed and no slug provided, generate new slug from title
    else if (title && title !== post.title) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, ''); // Clean up extra hyphens at start/end
    }
    
    // Only check for duplicate if slug is being changed
    if (finalSlug !== post.slug) {
      const existingPost = await Post.findOne({ slug: finalSlug, _id: { $ne: post._id } });
      if (existingPost) {
        return res.status(400).json({ message: 'A post with this slug already exists' });
      }
    }
    
    // Update post
    post.title = title || post.title;
    post.slug = finalSlug;
    post.content = content || post.content;
    post.status = status || post.status;
    post.featuredImage = featuredImage || post.featuredImage;
    
    if (categories) post.categories = categories;
    if (tags) post.tags = tags;
    if (publishDate) post.publishDate = new Date(publishDate);
    
    if (seo) {
      post.seo = {
        ...post.seo,
        ...seo,
      };
    }
    
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has required role (admin)
    if (!['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to delete posts' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await Post.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 