import { Request, Response } from 'express';
import SiteSettings, { ISiteSettings } from '../models/SiteSettings';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Get site settings
export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    // Find settings or create default if not exists
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'My Website',
        siteDescription: 'A modern content management system',
        siteUrl: 'https://example.com'
      });
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ message: 'Error fetching site settings', error });
  }
};

// Update site settings
export const updateSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update site settings' });
    }
    
    const {
      siteName,
      siteDescription,
      siteUrl,
      logo,
      favicon,
      contactEmail,
      contactPhone,
      address,
      socialMedia,
      seo,
      customScripts,
      theme,
      features
    } = req.body;
    
    // Get current settings or create if not exists
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'My Website',
        siteDescription: 'A modern content management system',
        siteUrl: 'https://example.com'
      });
    }
    
    // Update settings
    const updatedSettings = await SiteSettings.findByIdAndUpdate(
      settings._id,
      {
        siteName: siteName || settings.siteName,
        siteDescription: siteDescription || settings.siteDescription,
        siteUrl: siteUrl || settings.siteUrl,
        logo: logo !== undefined ? logo : settings.logo,
        favicon: favicon !== undefined ? favicon : settings.favicon,
        contactEmail: contactEmail !== undefined ? contactEmail : settings.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : settings.contactPhone,
        address: address !== undefined ? address : settings.address,
        socialMedia: socialMedia !== undefined ? {
          ...settings.socialMedia,
          ...socialMedia
        } : settings.socialMedia,
        seo: seo !== undefined ? {
          ...settings.seo,
          ...seo
        } : settings.seo,
        customScripts: customScripts !== undefined ? {
          ...settings.customScripts,
          ...customScripts
        } : settings.customScripts,
        theme: theme !== undefined ? {
          ...settings.theme,
          ...theme
        } : settings.theme,
        features: features !== undefined ? {
          ...settings.features,
          ...features
        } : settings.features
      },
      { new: true }
    );
    
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ message: 'Error updating site settings', error });
  }
}; 