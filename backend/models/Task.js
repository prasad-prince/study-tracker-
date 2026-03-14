const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // ⭐ CRITICAL: userId must be required and indexed
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // ⭐ Index for fast user-specific queries
  },
  text: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [500, 'Task description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Done', 'Cancelled'],
    default: 'Pending'
  },
  deadline: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ⭐ Compound index for efficient user-specific queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, deadline: 1 });

// ⭐ Middleware to automatically set completedAt when status changes to Done
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Done' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// ⭐ Static method to get user's task statistics
taskSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

module.exports = mongoose.model('Task', taskSchema);