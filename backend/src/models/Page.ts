import mongoose, { Document, Schema } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  featuredImage?: string;
  layout?: string;
  order?: number;
  parent?: mongoose.Types.ObjectId;
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

const PageSchema = new Schema<IPage>(
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
      ref: 'Page'
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
PageSchema.index({ slug: 1 }, { unique: true });
PageSchema.index({ title: 'text', content: 'text' });
PageSchema.index({ status: 1 });
PageSchema.index({ parent: 1 });

export default mongoose.model<IPage>('Page', PageSchema); 