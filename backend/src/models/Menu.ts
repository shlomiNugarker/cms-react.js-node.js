import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  title: string;
  path: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  icon?: string;
  children?: IMenuItem[];
  order: number;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
}

export interface IMenu extends Document {
  name: string;
  slug: string;
  description?: string;
  location?: string;
  items: IMenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
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
  children: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
  order: {
    type: Number,
    default: 0
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const MenuSchema = new Schema<IMenu>(
  {
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
  },
  {
    timestamps: true
  }
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export const Menu = mongoose.model<IMenu>('Menu', MenuSchema); 