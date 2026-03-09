import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
      type: String,
  },
  resetTokenExpiry: {
      type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User2', UserSchema);