const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // ⭐ CRITICAL: userId must be required and indexed
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // ⭐ Index for fast user-specific queries
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    index: true // ⭐ Index for date-based queries
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  },
  ipAddress: {
    type: String,
    default: null
  },
  deviceInfo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// ⭐ CRITICAL: Unique compound index to prevent duplicate attendance per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// ⭐ Additional indexes for efficient queries
attendanceSchema.index({ userId: 1, createdAt: -1 });
attendanceSchema.index({ userId: 1, status: 1 });

// ⭐ Pre-save middleware to normalize date (remove time component)
attendanceSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    const normalized = new Date(this.date);
    normalized.setHours(0, 0, 0, 0);
    this.date = normalized;
  }
  next();
});

// ⭐ Method to calculate duration
attendanceSchema.methods.calculateDuration = function() {
  if (this.loginTime && this.logoutTime) {
    this.duration = Math.round((this.logoutTime - this.loginTime) / 60000); // minutes
  }
  return this.duration;
};

// ⭐ Static method to get user's monthly attendance stats
attendanceSchema.statics.getMonthlyStats = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const records = await this.find({
    userId: mongoose.Types.ObjectId(userId),
    date: { $gte: startDate, $lte: endDate }
  });
  
  const totalDays = endDate.getDate();
  const presentDays = records.filter(r => r.status === 'Present').length;
  const totalMinutes = records.reduce((sum, r) => sum + (r.duration || 0), 0);
  
  return {
    totalDays,
    presentDays,
    absentDays: totalDays - presentDays,
    attendancePercentage: ((presentDays / totalDays) * 100).toFixed(2),
    totalHours: (totalMinutes / 60).toFixed(2),
    averageHoursPerDay: presentDays > 0 ? (totalMinutes / 60 / presentDays).toFixed(2) : 0
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema);