import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  publishDate?: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
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
    publishDate: {
      type: Date,
      default: Date.now
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
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });
PostSchema.index({ status: 1 });
PostSchema.index({ categories: 1 });
PostSchema.index({ publishDate: -1 });

export default mongoose.model<IPost>('Post', PostSchema); 