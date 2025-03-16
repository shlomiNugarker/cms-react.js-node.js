import { Request, Response } from 'express';
import Content, { IContent } from '../models/Content';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Create new content
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, contentType, status, categories, tags, metadata, featuredImage } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const existingContent = await Content.findOne({ slug });
    if (existingContent) {
      return res.status(400).json({ message: 'Content with this title already exists' });
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
    const { id } = req.params;
    const { title, content, contentType, status, categories, tags, metadata, featuredImage } = req.body;
    
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
    
    // Check if user is author or admin
    if (existingContent.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }
    
    // Generate new slug if title changed
    let slug = existingContent.slug;
    if (title && title !== existingContent.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
        
      // Check if new slug already exists (excluding current content)
      const slugExists = await Content.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Content with this title already exists' });
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
    
    // Check if user is author or admin
    if (content.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }
    
    await Content.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Error deleting content', error });
  }
}; 