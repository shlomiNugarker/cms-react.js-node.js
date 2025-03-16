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
  // SEO Fields
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    structuredData?: string;
  };
  // Layout Fields
  layout?: string;
  order?: number;
  parent?: mongoose.Types.ObjectId;
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
    // SEO Fields
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
      twitterTitle: String,
      twitterDescription: String,
      twitterImage: String,
      canonicalUrl: String,
      noIndex: {
        type: Boolean,
        default: false
      },
      structuredData: String,
    },
    // Layout Fields
    layout: String,
    order: {
      type: Number,
      default: 0
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Content'
    }
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
ContentSchema.index({ title: 'text', content: 'text', tags: 'text', 'seo.metaKeywords': 'text' });

export default mongoose.model<IContent>('Content', ContentSchema); 