# 📚 Study Tracker - Complete Learning Management System

A powerful, feature-rich web application for managing students' academic progress, tasks, notes, and attendance with advanced admin features.

**Repository:** https://github.com/prasad-prince/study-tracker-.git

---

## 🌟 Features

### **For Students:**
- ✅ User Registration & Secure Authentication (JWT)
- ✅ Task Management (Create, Update, Delete, Track Progress)
- ✅ Notes Management with File Attachments
- ✅ Notes Sorting (Newest, Oldest, A-Z, Z-A)
- ✅ Attendance Tracking
- ✅ Personal Dashboard with Statistics
- ✅ Dark Mode Support
- ✅ Profile Management
- ✅ AI Assistant Integration
- ✅ Calculator Tool

### **For Teachers:**
- ✅ Student Performance Overview
- ✅ Class Reports
- ✅ Attendance Management
- ✅ Task Assignment & Tracking
- ✅ Student List & Management

### **For Administrators:**
- ✅ **Admin Dashboard** with Real-time Statistics
- ✅ View All Users (with filtering)
- ✅ View All Notes & Content
- ✅ Monitor All Tasks & Progress
- ✅ Attendance Records Management
- ✅ System Statistics & Analytics
- ✅ Role-based Access Control

---

## 🏗️ Technology Stack

### **Backend:**
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - NoSQL Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication & Authorization
- **Bcryptjs** - Password Hashing (12 rounds)
- **CORS** - Cross-Origin Resource Sharing

### **Frontend:**
- **HTML5** - Markup
- **CSS3** - Styling
- **Bootstrap 5** - UI Framework
- **JavaScript (ES6+)** - Client-side Logic
- **Font Awesome** - Icons

### **Database:**
- **MongoDB Atlas** (Cloud) or **Local MongoDB**
- Collections: Users, Notes, Tasks, Attendance

---

## 📋 Project Structure

```
study-tracker/
├── backend/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User schema with auth
│   │   ├── Note.js              # Notes storage
│   │   ├── Task.js              # Task management
│   │   └── Attendance.js         # Attendance tracking
│   ├── public/
│   │   ├── index.html           # Landing page
│   │   ├── login.html           # Login page
│   │   ├── register.html        # Registration
│   │   ├── dashboard.html       # User dashboard
│   │   ├── notes.html           # Notes management
│   │   ├── tasks.html           # Task management
│   │   ├── attendance.html      # Attendance tracking
│   │   ├── admin.html           # Admin dashboard ⭐ NEW
│   │   └── [other pages]
│   ├── server.js                # Main Express server
│   ├── package.json             # Dependencies
│   └── .env                     # Environment variables
└── README.md                    # This file
```

---

## ⚙️ Installation & Setup

### **Prerequisites:**
- Node.js (v14 or higher)
- MongoDB (Cloud or Local)
- Git

### **Step 1: Clone Repository**

```bash
git clone https://github.com/prasad-prince/study-tracker-.git
cd study-tracker
cd backend
```

### **Step 2: Install Dependencies**

```bash
npm install
```

### **Step 3: Configure Environment Variables**

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=4001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study_tracker?retryWrites=true&w=majority
# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/study_tracker

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# Email (Optional - for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# API Configuration
API_PORT=4001
```

### **Step 4: Start MongoDB**

**Option A - Local MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
mongod
```

**Option B - MongoDB Atlas (Cloud):**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account & cluster
- Get connection string & add to `.env`

### **Step 5: Start Server**

```bash
npm start
```

✅ Server running at: `http://localhost:4001`

---

## 🚀 How to Use

### **1. Access Application**

**Open Browser:**
```
http://localhost:4001
```

### **2. Create Account**

1. Click **"Register"**
2. Fill in details:
   - Name: Your Full Name
   - Email: your.email@example.com
   - Password: At least 6 characters
   - Role: `student` (default), `teacher`, or `admin`
3. Click **"Register"**
4. Login with credentials

### **3. Student Features**

#### **Dashboard**
- View tasks & notes statistics
- See attendance percentage
- Progress tracking
- Role badge display

#### **Notes Management**
```
1. Go to "My Notes"
2. Write note content
3. Optional: Upload files (PDF, DOC, Images)
4. Click "Save Note"
5. View saved notes with sorting:
   - Newest First
   - Oldest First
   - A to Z
   - Z to A
6. Delete notes (no confirmation pop-up)
7. Download notes as text file
```

#### **Tasks**
```
1. Go to "Tasks"
2. Create new task with:
   - Description
   - Priority (Low, Medium, High)
   - Deadline (optional)
3. Update task status: Pending → In Progress → Done
4. View task statistics
```

#### **Attendance**
```
1. Click "Mark Attendance" when you login
2. System tracks:
   - Login time
   - Logout time
   - Session duration
   - Attendance status
```

#### **Profile**
```
1. View personal information
2. Update profile picture
3. Edit bio/about section
4. Change password
```

### **4. Teacher Features**

Access via Role Selection:
```
1. After login, teacher can:
   - View all students list
   - Generate class reports
   - Manage attendance
   - Track student progress
   - View assigned tasks
```

### **5. Admin Features** ⭐

**Access Admin Dashboard:**
```
1. Register/Login as ADMIN role
2. Go to: http://localhost:4001/admin.html
3. View dashboard with:
```

#### **Admin Statistics:**
- Total Users Count
- Total Notes Created
- Total Tasks Assigned
- Total Attendance Records
- Tasks Completed/Pending/In Progress
- Today's Present/Absent Count

#### **Admin Data Tables:**

**👥 Users Table**
- View all registered users
- User names, emails, roles
- Registration dates

**📝 Notes Table**
- All notes from all users
- Note content preview
- User who created it
- File attachments count
- Created date

**✓ Tasks Table**
- All tasks in system
- Task descriptions
- Priority levels
- Current status
- Deadlines
- Created by whom

**📅 Attendance Table**
- Complete attendance records
- User information
- Date & status (Present/Absent)
- Login/Logout times
- Session duration in minutes

---

## 📱 API Endpoints

### **Authentication**
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
```

### **Notes (Protected)**
```
GET    /api/notes               - Get all user's notes
POST   /api/notes               - Create new note
DELETE /api/notes/:id           - Delete note
```

### **Tasks (Protected)**
```
GET    /api/tasks               - Get all user's tasks
POST   /api/tasks               - Create new task
PUT    /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task
```

### **Attendance (Protected)**
```
GET    /api/attendance          - Get user's attendance
POST   /api/attendance/logout   - Log logout time
```

### **Admin (Protected - Admin Role Only)**
```
GET    /api/admin/stats         - Get dashboard statistics
GET    /api/admin/users         - Get all users
GET    /api/admin/notes         - Get all notes
GET    /api/admin/tasks         - Get all tasks
GET    /api/admin/attendance    - Get all attendance
```

---

## 🔐 Authentication Details

### **JWT Token Flow:**
```
1. User registers/logs in
2. Password hashed with bcryptjs (12 rounds)
3. JWT token generated (expires in 7 days)
4. Token stored in localStorage
5. Token sent with every API request
6. Server verifies token before allowing access
```

### **Password Security:**
- Minimum 6 characters
- Hashed with bcryptjs (12 rounds of salt)
- Never stored in plain text
- Password hash length: 60 characters

### **Token Format:**
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": "user_mongodb_id",
  "email": "user@example.com",
  "role": "student",
  "iat": timestamp,
  "exp": timestamp
}

Signature: HMAC-SHA256(header.payload, secret)
```

---

## 💾 Data Storage

### **MongoDB Collections:**

#### **Users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (student/teacher/admin),
  profilePicture: String,
  bio: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Notes**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  text: String (500-10000 chars),
  files: [
    {
      name: String,
      size: Number,
      type: String,
      url: String
    }
  ],
  tags: [String],
  isPinned: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Tasks**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  text: String,
  priority: String (low/medium/high),
  status: String (Pending/In Progress/Done/Cancelled),
  deadline: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Attendance**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  email: String,
  date: Date,
  loginTime: Date,
  logoutTime: Date,
  duration: Number (minutes),
  status: String (Present/Absent/Late),
  ipAddress: String,
  deviceInfo: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing the Application

### **Test Accounts:**

**Student Account:**
```
Email: student@example.com
Password: Student@123
```

**Teacher Account:**
```
Email: teacher@example.com
Password: Teacher@123
```

**Admin Account:**
```
Email: admin@example.com
Password: Admin@123
```

### **Create Your Own Account:**
1. Go to Register page
2. Fill all fields
3. Select your role
4. Submit

---

## 📊 Admin Dashboard Guide

### **Accessing Admin Dashboard:**

1. **Register/Login as Admin:**
   - Email: admin@example.com
   - Password: Admin@123
   - Role: must be "admin"

2. **Open Admin Page:**
   ```
   http://localhost:4001/admin.html
   ```

3. **Dashboard Features:**
   - Real-time statistics (top)
   - 4 data tables with tabs
   - Search & filter capabilities
   - Responsive design
   - Dark mode support

### **Admin Permissions:**
- ✅ View all users
- ✅ Access all notes
- ✅ Monitor all tasks
- ✅ Track attendance
- ✅ View system statistics
- ❌ Cannot edit/delete (view-only for data protection)

---

## 🐛 Troubleshooting

### **Connection Errors**

**"Cannot connect to MongoDB"**
```
Solution:
1. Check MongoDB is running
2. Verify MONGODB_URI in .env
3. Check internet (if using cloud)
4. Ensure IP is whitelisted (Atlas)
```

**"Port 4001 already in use"**
```
Solution:
1. Change PORT in .env
2. Or kill process: netstat -ano | findstr :4001
```

### **Authentication Issues**

**"Invalid email or password"**
```
- Email not registered
- Wrong password
- Email case sensitivity issues
- User account not activated
```

**"Token expired"**
```
- Login again
- Token validity: 7 days
- Clear localStorage if needed
```

### **Data Issues**

**"Notes not saving"**
```
- Check API endpoint: /api/notes
- Verify JWT token in Headers
- Check browser console (F12)
- Ensure MongoDB is connected
```

**"Admin Dashboard not loading"**
```
- Must login as admin role
- Check /api/admin/stats endpoint
- Verify token is valid
- Clear browser cache
```

---

## 📱 APK File (Android App)

### **Coming Soon!** 📦

To convert this web app to APK:

```bash
# Option 1: Using Apache Cordova
cordova create study-tracker
cordova plugin add cordova-plugin-android-permissions
cordova build android

# Option 2: Using React Native (Recommended)
npm install -g react-native-cli
# Convert and build for Android

# Option 3: Using PWA → APK converter
# Upload web app to PWA builder
```

**Expected APK Size:** ~50-80 MB (with all features)

---

## 📥 Download Links

### **Repository:**
- **GitHub:** https://github.com/prasad-prince/study-tracker-.git
- **Clone Command:**
  ```bash
  git clone https://github.com/prasad-prince/study-tracker-.git
  ```

### **Dependencies:**
All required packages are listed in `backend/package.json`:
```
npm install
```

### **Live Demo:**
Coming soon! (Will be hosted on Vercel/Heroku)

---

## 🔄 Updates & Maintenance

### **Recent Changes (Latest Commit):**
- ✅ MongoDB integration for all data
- ✅ Admin Dashboard with statistics
- ✅ Notes sorting (4 options)
- ✅ Improved authentication
- ✅ Enhanced error handling
- ✅ Admin API endpoints
- ✅ Dashboard initialization logging

### **Planned Features:**
- [ ] Email notifications
- [ ] Real-time chat between students & teachers
- [ ] Video call integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Certificates generation
- [ ] Payment integration
- [ ] API rate limiting

---

## 📝 Environment Variables Reference

```env
# Server
PORT=4001                                    # Default port
NODE_ENV=development                         # development/production

# Database
MONGODB_URI=mongodb://localhost:27017/db    # MongoDB connection string
DB_NAME=study_tracker                        # Database name

# Authentication
JWT_SECRET=your_very_secret_key_here        # JWT signing key (min 32 chars)
JWT_EXPIRY=7d                               # Token expiration

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# API Limits (Optional)
MAX_REQUEST_SIZE=50mb
REQUEST_TIMEOUT=30000
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author & Support

**Created by:** Prasad Prince
**Repository:** https://github.com/prasad-prince/study-tracker-.git

### **For Issues & Support:**
1. Check GitHub Issues
2. Review API documentation
3. Check browser console (F12)
4. Verify environment variables

---

## 📞 Contact & Feedback

Have questions or suggestions? Feel free to:
- Open GitHub Issue
- Create Discussion thread
- Submit Pull Request

---

## 🎯 Quick Start Checklist

- [ ] Clone repository
- [ ] Install Node.js
- [ ] Install MongoDB
- [ ] Create `.env` file
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Open http://localhost:4001
- [ ] Register and explore!
- [ ] Access admin dashboard (if admin)

---

**Last Updated:** March 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready

---

**Happy Learning! 📚✨**