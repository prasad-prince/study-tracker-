const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  // ⭐ CRITICAL: userId must be required and indexed
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // ⭐ Index for fast user-specific queries
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: 'Untitled Note'
  },
  text: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [10000, 'Note content cannot exceed 10000 characters']
  },
  files: [{
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      default: null
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ⭐ Compound indexes for efficient queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ userId: 1, tags: 1 });

// ⭐ Text index for search functionality
noteSchema.index({ title: 'text', text: 'text' });

// ⭐ Static method to search user's notes
noteSchema.statics.searchUserNotes = async function(userId, searchTerm) {
  return this.find({
    userId: mongoose.Types.ObjectId(userId),
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Note', noteSchema);