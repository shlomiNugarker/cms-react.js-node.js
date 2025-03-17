import { Content, IContent } from '../models/Content';
import { AppError } from '../utils/errorHandler';
import mongoose from 'mongoose';

export class ContentService {
  static async createContent(contentData: {
    title: string;
    content: string;
    type: 'page' | 'post';
    status?: 'draft' | 'published';
    author: string;
  }): Promise<IContent> {
    const content = await Content.create(contentData);
    return content;
  }

  static async getContent(query: {
    type?: 'page' | 'post';
    status?: 'draft' | 'published';
    author?: string;
  }): Promise<IContent[]> {
    const filter: Record<string, any> = {};
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.author) filter.author = query.author;

    const content = await Content.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    return content;
  }

  static async getContentById(id: string): Promise<IContent> {
    const content = await Content.findById(id).populate('author', 'name');
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    return content;
  }

  static async updateContent(id: string, updateData: {
    title?: string;
    content?: string;
    type?: 'page' | 'post';
    status?: 'draft' | 'published';
  }): Promise<IContent> {
    const content = await Content.findById(id);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    Object.assign(content, updateData);
    await content.save();

    return content;
  }

  static async deleteContent(id: string): Promise<{ message: string }> {
    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    return { message: 'Content deleted successfully' };
  }

  static async publishContent(id: string): Promise<IContent> {
    const content = await Content.findById(id);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    content.status = 'published';
    await content.save();

    return content;
  }
} 