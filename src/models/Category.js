import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  color: { type: String, default: '#000000' }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
