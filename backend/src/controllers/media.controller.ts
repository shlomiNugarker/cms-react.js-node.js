import { Request, Response } from 'express';
import Media, { IMedia } from '../models/Media';
import mongoose from 'mongoose';
import { IUser } from '../models/User';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Extended Request interface with file property from multer
interface FileRequest extends AuthRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Make sure Express namespace includes Multer
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

// Upload media file
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { originalname, mimetype, size, filename, path: filePath } = req.file;
    
    // Generate URL for the file
    const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${filename}`;
    
    const newMedia = new Media({
      filename,
      originalname,
      mimetype,
      size,
      path: filePath,
      url,
      uploadedBy: req.user._id,
    });
    
    const savedMedia = await newMedia.save();
    
    res.status(201).json(savedMedia);
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Error uploading media', error });
  }
};

// Get all media files with pagination and filtering
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      mimetype,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter object
    const filter: any = {};
    
    if (mimetype) {
      // Handle multiple mimetypes (e.g. image/*, video/*)
      if ((mimetype as string).includes('*')) {
        const mimePrefix = (mimetype as string).split('*')[0];
        filter.mimetype = { $regex: new RegExp(`^${mimePrefix}`) };
      } else {
        filter.mimetype = mimetype;
      }
    }
    
    // Add text search if provided
    if (search) {
      filter.$or = [
        { originalname: { $regex: search as string, $options: 'i' } },
        { alt: { $regex: search as string, $options: 'i' } },
        { caption: { $regex: search as string, $options: 'i' } },
      ];
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const mediaFiles = await Media.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('uploadedBy', 'username email');
    
    const total = await Media.countDocuments(filter);
    
    res.status(200).json({
      mediaFiles,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({ message: 'Error fetching media files', error });
  }
};

// Get media by ID
export const getMediaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }
    
    const media = await Media.findById(id).populate('uploadedBy', 'username email');
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    res.status(200).json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Error fetching media', error });
  }
};

// Update media metadata
export const updateMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { alt, caption } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }
    
    const media = await Media.findById(id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Check if user is uploader or admin
    if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this media' });
    }
    
    const updatedMedia = await Media.findByIdAndUpdate(
      id,
      {
        alt: alt !== undefined ? alt : media.alt,
        caption: caption !== undefined ? caption : media.caption,
      },
      { new: true }
    ).populate('uploadedBy', 'username email');
    
    res.status(200).json(updatedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ message: 'Error updating media', error });
  }
};

// Delete media
export const deleteMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }
    
    const media = await Media.findById(id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Check if user is uploader or admin
    if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this media' });
    }
    
    // Delete file from filesystem
    try {
      fs.unlinkSync(media.path);
    } catch (err) {
      console.error('Error deleting file from filesystem:', err);
      // Continue with deletion from database even if file deletion fails
    }
    
    await Media.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: 'Error deleting media', error });
  }
}; 