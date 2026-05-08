import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  categoryId: { type: String, required: true },
  author: { type: String },
  imageUrl: { type: String },
  isBreaking: { type: Boolean, default: false },
  slug: { type: String, required: true, unique: true },
  publishedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
