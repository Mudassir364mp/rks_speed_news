import dbConnect from './mongoose';
import Article from '../models/Article';
import Category from '../models/Category';
import BreakingNews from '../models/BreakingNews';
import Ad from '../models/Ad';

// General Helper for reading data (now uses MongoDB)
export const readData = async (model) => {
  await dbConnect();
  try {
    return await model.find({}).lean();
  } catch (error) {
    console.error(`Error reading from ${model.modelName}:`, error);
    return [];
  }
};

// General Helper for writing data (replaces or creates)
export const writeData = async (model, data) => {
  await dbConnect();
  try {
    // If it's an array, we might want to refresh the whole collection or handle items.
    // For simplicity, matching the old file system 'overwrite' behavior:
    await model.deleteMany({});
    await model.insertMany(data);
    return true;
  } catch (error) {
    console.error(`Error writing to ${model.modelName}:`, error);
    return false;
  }
};

// Helpers for specific collections
export const getArticles = async () => {
  await dbConnect();
  try {
    return await Article.find({}).sort({ publishedAt: -1 }).lean();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

export const saveArticles = async (articles) => {
  await dbConnect();
  try {
    // Note: In a real app, you'd probably use updateOne or similar.
    // But to maintain parity with the previous 'fs.writeFileSync' behavior:
    await Article.deleteMany({});
    await Article.insertMany(articles);
    return true;
  } catch (error) {
    console.error("Error saving articles:", error);
    return false;
  }
};

export const getCategories = async () => {
  await dbConnect();
  try {
    return await Category.find({}).lean();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const saveCategories = async (categories) => {
  await dbConnect();
  try {
    await Category.deleteMany({});
    await Category.insertMany(categories);
    return true;
  } catch (error) {
    console.error("Error saving categories:", error);
    return false;
  }
};

export const getBreakingNews = async () => {
  await dbConnect();
  try {
    return await BreakingNews.find({}).lean();
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    return [];
  }
};

export const saveBreakingNews = async (news) => {
  await dbConnect();
  try {
    await BreakingNews.deleteMany({});
    await BreakingNews.insertMany(news);
    return true;
  } catch (error) {
    console.error("Error saving breaking news:", error);
    return false;
  }
};

export const getAds = async () => {
  await dbConnect();
  try {
    return await Ad.find({}).lean();
  } catch (error) {
    console.error("Error fetching ads:", error);
    return [];
  }
};

export const saveAds = async (ads) => {
  await dbConnect();
  try {
    await Ad.deleteMany({});
    await Ad.insertMany(ads);
    return true;
  } catch (error) {
    console.error("Error saving ads:", error);
    return false;
  }
};
