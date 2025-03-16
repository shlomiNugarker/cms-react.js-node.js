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
exports.Menu = exports.MenuItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MenuItemSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    target: {
        type: String,
        enum: ['_blank', '_self', '_parent', '_top'],
        default: '_self'
    },
    icon: String,
    children: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'MenuItem' }],
    order: {
        type: Number,
        default: 0
    },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MenuItem'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});
const MenuSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: String,
    location: String,
    items: [MenuItemSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
exports.MenuItem = mongoose_1.default.model('MenuItem', MenuItemSchema);
exports.Menu = mongoose_1.default.model('Menu', MenuSchema);
