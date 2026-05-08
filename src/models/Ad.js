import mongoose from 'mongoose';

const AdSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  type: { type: String, enum: ['image', 'html'], required: true },
  image: { type: String },
  link: { type: String },
  code: { type: String },
  active: { type: Boolean, default: true }
});

export default mongoose.models.Ad || mongoose.model('Ad', AdSchema);
