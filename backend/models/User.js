const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // ⭐ Index for faster queries
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // ⭐ Never return password by default
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // createdAt, updatedAt
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password; // ⭐ Remove password from JSON response
      return ret;
    }
  }
});

// ⭐ Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    // Hash password with bcrypt (12 rounds for security)
    this.password = await bcrypt.hash(this.password, 12);
    console.log('✅ Password hashed for email:', this.email);
    next();
  } catch (error) {
    console.error('❌ Password hashing failed:', error.message);
    next(error);
  }
});

// ⭐ Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// ⭐ Method to get safe user object (without sensitive data)
userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profilePicture: this.profilePicture,
    bio: this.bio,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);