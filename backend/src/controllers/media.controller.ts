import { Request, Response } from 'express';
import Media, { IMedia } from '../models/Media';
import mongoose from 'mongoose';
import { IUser } from '../models/User';
import fs from 'fs';
import path from 'path';
import cloudinaryService from '../services/cloudinary.service';

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
    
    // Always attempt to use Cloudinary if configured
    let cloudinaryResult;
    const useCloudinary = process.env.USE_CLOUDINARY === 'true';
    
    if (useCloudinary) {
      try {
        console.log('Uploading to Cloudinary:', filePath);
        // Upload to Cloudinary
        cloudinaryResult = await cloudinaryService.uploadToCloudinary(filePath, {
          resource_type: mimetype.startsWith('video/') ? 'video' : 'auto',
          folder: 'media',
        });
        console.log('Cloudinary upload result:', cloudinaryResult ? 'success' : 'failure');
      } catch (cloudinaryError) {
        console.error('Error uploading to Cloudinary:', cloudinaryError);
        // Continue with local storage if Cloudinary fails
      }
    } else {
      console.log('Cloudinary uploads disabled, using local storage');
    }
    
    const newMedia = new Media({
      filename,
      originalname,
      mimetype,
      size,
      path: filePath,
      url: cloudinaryResult?.secure_url || url,
      mediaType: 'file',
      uploadedBy: req.user._id,
    });
    
    const savedMedia = await newMedia.save();
    
    res.status(201).json(savedMedia);
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Error uploading media', error });
  }
};

// Add embedded media (YouTube, Vimeo)
export const addEmbeddedMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { url, sourceType, embedCode, title, alt, caption } = req.body;
    
    if (!url || !sourceType || !embedCode) {
      return res.status(400).json({ message: 'URL, sourceType and embedCode are required' });
    }
    
    // Generate a unique filename for the embedded media
    const filename = `embedded_${sourceType}_${Date.now()}`;
    
    const newMedia = new Media({
      filename,
      originalname: title || `Embedded ${sourceType} video`,
      mimetype: 'video/embedded',
      size: 0, // Embedded media doesn't have a file size
      path: '', // No local path for embedded media
      url,
      mediaType: 'embedded',
      sourceType,
      embedCode,
      alt,
      caption,
      uploadedBy: req.user._id,
    });
    
    const savedMedia = await newMedia.save();
    
    res.status(201).json(savedMedia);
  } catch (error) {
    console.error('Error adding embedded media:', error);
    res.status(500).json({ message: 'Error adding embedded media', error });
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

// Update media
export const updateMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { alt, caption, url, embedCode } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }
    
    const media = await Media.findById(id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Update media properties
    if (alt !== undefined) media.alt = alt;
    if (caption !== undefined) media.caption = caption;
    if (url !== undefined && media.mediaType === 'embedded') media.url = url;
    if (embedCode !== undefined && media.mediaType === 'embedded') media.embedCode = embedCode;
    
    const updatedMedia = await media.save();
    
    res.json(updatedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ message: 'Error updating media', error });
  }
};

// Delete media
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No media IDs provided' });
    }
    
    // Find all media items to delete
    const mediaItems = await Media.find({ _id: { $in: ids } });
    
    if (mediaItems.length === 0) {
      return res.status(404).json({ message: 'No media found with provided IDs' });
    }
    
    // Delete files from storage
    for (const media of mediaItems) {
      if (media.mediaType === 'file') {
        // Check if it's a Cloudinary URL
        if (media.url.includes('cloudinary.com')) {
          // Extract public_id from URL
          const publicId = media.url.split('/').slice(-1)[0].split('.')[0];
          try {
            await cloudinaryService.deleteFromCloudinary(publicId);
          } catch (err) {
            console.error(`Error deleting file from Cloudinary: ${publicId}`, err);
          }
        } else if (fs.existsSync(media.path)) {
          // Delete local file
          fs.unlinkSync(media.path);
        }
      }
    }
    
    // Delete media documents from database
    await Media.deleteMany({ _id: { $in: ids } });
    
    res.json({ message: 'Media deleted successfully', count: mediaItems.length });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: 'Error deleting media', error });
  }
};

// Check Cloudinary configuration status
export const getCloudinaryStatus = async (req: Request, res: Response) => {
  try {
    const isEnabled = process.env.USE_CLOUDINARY === 'true';
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
    
    const isFullyConfigured = isEnabled && hasCloudName && hasApiKey && hasApiSecret;
    
    res.json({
      enabled: isFullyConfigured,
      status: {
        enabled: isEnabled,
        cloudName: hasCloudName,
        apiKey: hasApiKey,
        apiSecret: hasApiSecret
      }
    });
  } catch (error) {
    console.error('Error checking Cloudinary status:', error);
    res.status(500).json({ message: 'Error checking Cloudinary status', error });
  }
}; 