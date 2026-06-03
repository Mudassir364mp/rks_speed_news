import dbConnect from './mongoose';
import Article from '../models/Article';
import Category from '../models/Category';
import BreakingNews from '../models/BreakingNews';
import Ad from '../models/Ad';

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

// âœ… FIXED â€” NO deleteMany
export const saveArticles = async (articles) => {
  await dbConnect();
  try {
    if (!Array.isArray(articles)) return false;

    for (const article of articles) {
      await Article.findOneAndUpdate(
        { slug: article.slug },
        article,
        { upsert: true, returnDocument: "after" }
      );
    }
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
    if (!Array.isArray(categories)) return false;

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, returnDocument: "after" }
      );
    }
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
    if (!Array.isArray(news)) return false;

    for (const item of news) {
      await BreakingNews.findOneAndUpdate(
        { slug: item.slug || item.id },
        item,
        { upsert: true, returnDocument: "after" }
      );
    }
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
    if (!Array.isArray(ads)) return false;

    for (const ad of ads) {
      await Ad.findOneAndUpdate(
        { position: ad.position || ad.id },
        ad,
        { upsert: true, returnDocument: "after" }
      );
    }
    return true;
  } catch (error) {
    console.error("Error saving ads:", error);
    return false;
  }
};



