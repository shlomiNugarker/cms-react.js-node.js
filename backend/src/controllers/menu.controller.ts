import { Request, Response } from 'express';
import { Menu} from '../models/Menu';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

// Extended Request interface with user property
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

// Create new menu
export const createMenu = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create menus' });
    }
    
    const { name, slug, description, location, items } = req.body;
    
    // Check if slug already exists
    const existingMenu = await Menu.findOne({ slug });
    if (existingMenu) {
      return res.status(400).json({ message: 'Menu with this slug already exists' });
    }
    
    const newMenu = new Menu({
      name,
      slug,
      description,
      location,
      items: items || []
    });
    
    const savedMenu = await newMenu.save();
    
    res.status(201).json(savedMenu);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ message: 'Error creating menu', error });
  }
};

// Get all menus
export const getAllMenus = async (req: Request, res: Response) => {
  try {
    const menus = await Menu.find();
    
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Error fetching menus', error });
  }
};

// Get menu by slug
export const getMenuBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const menu = await Menu.findOne({ slug });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    res.status(200).json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Error fetching menu', error });
  }
};

// Update menu
export const updateMenu = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update menus' });
    }
    
    const { id } = req.params;
    const { name, description, location, items, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu ID' });
    }
    
    const menu = await Menu.findById(id);
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      {
        name: name || menu.name,
        description: description !== undefined ? description : menu.description,
        location: location !== undefined ? location : menu.location,
        items: items || menu.items,
        isActive: isActive !== undefined ? isActive : menu.isActive
      },
      { new: true }
    );
    
    res.status(200).json(updatedMenu);
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ message: 'Error updating menu', error });
  }
};

// Delete menu
export const deleteMenu = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete menus' });
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu ID' });
    }
    
    const menu = await Menu.findById(id);
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    await Menu.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ message: 'Error deleting menu', error });
  }
}; 