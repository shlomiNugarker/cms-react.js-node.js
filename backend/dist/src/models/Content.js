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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ContentSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Content'
    }
}, {
    timestamps: true,
});
// Create text index for search functionality
ContentSchema.index({ title: 'text', content: 'text', tags: 'text', 'seo.metaKeywords': 'text' });
exports.default = mongoose_1.default.model('Content', ContentSchema);
