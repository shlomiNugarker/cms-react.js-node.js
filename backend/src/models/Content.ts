import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  title: string;
  content: string;
  type: 'page' | 'post';
  status: 'draft' | 'published';
  author: mongoose.Types.ObjectId;
  slug: string;
  categories: string[];
  tags: string[];
  metadata: Record<string, string>;
  featuredImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  type: {
    type: String,
    enum: ['page', 'post'],
    required: [true, 'Content type is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
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
    default: {},
  },
  featuredImage: {
    type: String,
  },
}, {
  timestamps: true,
});

const ContentModel = mongoose.model<IContent>('Content', contentSchema);
export { ContentModel as Content }; 