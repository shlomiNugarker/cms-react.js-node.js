import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
  };
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string[];
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
  customScripts?: {
    header?: string;
    footer?: string;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  features?: {
    enableBlog?: boolean;
    enableComments?: boolean;
    enableRegistration?: boolean;
    enableSearch?: boolean;
    enableNewsletter?: boolean;
  };
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      required: true,
      trim: true
    },
    siteDescription: {
      type: String,
      required: true,
      trim: true
    },
    siteUrl: {
      type: String,
      required: true,
      trim: true
    },
    logo: String,
    favicon: String,
    contactEmail: String,
    contactPhone: String,
    address: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      pinterest: String
    },
    seo: {
      defaultTitle: String,
      defaultDescription: String,
      defaultKeywords: [String],
      googleAnalyticsId: String,
      googleTagManagerId: String,
      facebookPixelId: String
    },
    customScripts: {
      header: String,
      footer: String
    },
    theme: {
      primaryColor: String,
      secondaryColor: String,
      fontFamily: String
    },
    features: {
      enableBlog: {
        type: Boolean,
        default: true
      },
      enableComments: {
        type: Boolean,
        default: true
      },
      enableRegistration: {
        type: Boolean,
        default: true
      },
      enableSearch: {
        type: Boolean,
        default: true
      },
      enableNewsletter: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one settings document exists
SiteSettingsSchema.statics.findOneOrCreate = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  return this.create({
    siteName: 'My Website',
    siteDescription: 'A modern content management system',
    siteUrl: 'https://example.com'
  });
};

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema); 