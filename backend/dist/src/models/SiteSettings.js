"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SiteSettingsSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true
});
// Ensure only one settings document exists
SiteSettingsSchema.statics.findOneOrCreate = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = yield this.findOne();
        if (settings) {
            return settings;
        }
        return this.create({
            siteName: 'My Website',
            siteDescription: 'A modern content management system',
            siteUrl: 'https://example.com'
        });
    });
};
exports.default = mongoose_1.default.model('SiteSettings', SiteSettingsSchema);
