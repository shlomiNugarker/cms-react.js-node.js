"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSiteSettings = exports.getSiteSettings = void 0;
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
// Get site settings
const getSiteSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find settings or create default if not exists
        let settings = yield SiteSettings_1.default.findOne();
        if (!settings) {
            settings = yield SiteSettings_1.default.create({
                siteName: 'My Website',
                siteDescription: 'A modern content management system',
                siteUrl: 'https://example.com'
            });
        }
        res.status(200).json(settings);
    }
    catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ message: 'Error fetching site settings', error });
    }
});
exports.getSiteSettings = getSiteSettings;
// Update site settings
const updateSiteSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update site settings' });
        }
        const { siteName, siteDescription, siteUrl, logo, favicon, contactEmail, contactPhone, address, socialMedia, seo, customScripts, theme, features } = req.body;
        // Get current settings or create if not exists
        let settings = yield SiteSettings_1.default.findOne();
        if (!settings) {
            settings = yield SiteSettings_1.default.create({
                siteName: 'My Website',
                siteDescription: 'A modern content management system',
                siteUrl: 'https://example.com'
            });
        }
        // Update settings
        const updatedSettings = yield SiteSettings_1.default.findByIdAndUpdate(settings._id, {
            siteName: siteName || settings.siteName,
            siteDescription: siteDescription || settings.siteDescription,
            siteUrl: siteUrl || settings.siteUrl,
            logo: logo !== undefined ? logo : settings.logo,
            favicon: favicon !== undefined ? favicon : settings.favicon,
            contactEmail: contactEmail !== undefined ? contactEmail : settings.contactEmail,
            contactPhone: contactPhone !== undefined ? contactPhone : settings.contactPhone,
            address: address !== undefined ? address : settings.address,
            socialMedia: socialMedia !== undefined ? Object.assign(Object.assign({}, settings.socialMedia), socialMedia) : settings.socialMedia,
            seo: seo !== undefined ? Object.assign(Object.assign({}, settings.seo), seo) : settings.seo,
            customScripts: customScripts !== undefined ? Object.assign(Object.assign({}, settings.customScripts), customScripts) : settings.customScripts,
            theme: theme !== undefined ? Object.assign(Object.assign({}, settings.theme), theme) : settings.theme,
            features: features !== undefined ? Object.assign(Object.assign({}, settings.features), features) : settings.features
        }, { new: true });
        res.status(200).json(updatedSettings);
    }
    catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ message: 'Error updating site settings', error });
    }
});
exports.updateSiteSettings = updateSiteSettings;
