import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku: string;
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  featuredImage?: string;
  galleryImages?: string[];
  categories: string[];
  tags: string[];
  inStock: boolean;
  stockQuantity?: number;
  attributes?: Map<string, string>;
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

const ProductSchema = new Schema<IProduct>(
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
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
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
    galleryImages: [{
      type: String,
    }],
    categories: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      min: 0,
    },
    attributes: {
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
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ status: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ inStock: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema); 