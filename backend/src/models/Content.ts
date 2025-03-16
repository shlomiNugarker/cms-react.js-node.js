import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  slug: string;
  content: string;
  contentType: 'page' | 'post' | 'product' | 'custom';
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  metadata: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['page', 'post', 'product', 'custom'],
      default: 'post',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    featuredImage: {
      type: String,
    },
    categories: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
ContentSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model<IContent>('Content', ContentSchema); 