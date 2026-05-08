import mongoose from 'mongoose';

const BreakingNewsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  link: { type: String }
});

export default mongoose.models.BreakingNews || mongoose.model('BreakingNews', BreakingNewsSchema);
