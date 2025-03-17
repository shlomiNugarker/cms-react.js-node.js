import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  mediaType: 'file' | 'embedded';
  sourceType?: 'youtube' | 'vimeo' | 'cloudinary' | 'other';
  embedCode?: string;
  alt?: string;
  caption?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['file', 'embedded'],
      default: 'file',
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['youtube', 'vimeo', 'cloudinary', 'other'],
    },
    embedCode: {
      type: String,
    },
    alt: {
      type: String,
    },
    caption: {
      type: String,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMedia>('Media', MediaSchema); 