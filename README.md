"# Study Goal Tracker

A comprehensive web application designed to help students track their study goals, manage tasks, take notes, monitor attendance, and access AI-powered assistance. Built with a modern full-stack architecture featuring a responsive frontend and a robust Node.js backend.

## 🎯 Features

### Core Functionality
- **User Authentication**: Secure registration and login system with JWT tokens
- **Dashboard**: Overview of study progress and quick access to all features
- **Task Management**: Create, track, and manage study tasks with deadlines
- **Notes System**: Rich text notes with AI-powered note generation
- **Attendance Tracking**: Monitor study sessions and attendance records
- **Student Management**: Admin interface for managing student accounts
- **Reports**: Generate progress reports and analytics
- **Calculator**: Built-in calculator for quick calculations
- **AI Assistant**: Powered by OpenAI GPT-4o-mini or Google Gemini for study help
- **Contact Form**: Send messages with validation and logging

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Updates**: Dynamic content updates without page refresh
- **File-based Persistence**: Simple JSON file storage for demo purposes
- **API Integration**: RESTful API with comprehensive endpoints
- **Security**: Password hashing, JWT authentication, CORS support

## 🛠 Tech Stack

### Frontend
- **HTML5/CSS3**: Semantic markup and custom styling
- **Tailwind CSS**: Utility-first CSS framework
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Chart.js**: Data visualization for reports
- **Font Awesome**: Icon library
- **Google Fonts**: Poppins and Inter font families

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for API development
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **File System**: JSON-based data persistence

### AI Integration
- **OpenAI GPT-4o-mini**: Primary AI assistant (requires API key)
- **Google Gemini 1.5 Flash**: Fallback AI service (requires API key)
- **Fallback Mode**: Simple rule-based responses when no API keys are configured

## 📁 Project Structure

```
study-tracker/
├── package.json                 # Root package configuration
├── server.js                    # Root server entry point (deprecated)
├── backend/
│   ├── package.json            # Backend dependencies
│   ├── server.js               # Main Express server
│   └── data/
│       ├── users.json          # User accounts storage
│       ├── userdata.json       # User data (notes, attendance, etc.)
│       └── contact-submissions.json # Contact form submissions
├── fornted/                    # Frontend application
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.htm            # Registration page
│   ├── dashboard.html          # Main dashboard
│   ├── students.html           # Student management
│   ├── tasks.html              # Task management
│   ├── notes.html              # Notes system
│   ├── reports.html            # Reports and analytics
│   ├── attendance.html         # Attendance tracking
│   ├── profile.html            # User profile
│   ├── calculator.html         # Calculator tool
│   ├── assistant.html          # AI assistant interface
│   ├── contact.html            # Contact form
│   ├── api/                    # Frontend API handlers
│   │   ├── assistant.js        # AI assistant API calls
│   │   ├── data.js             # User data API calls
│   │   ├── login.js            # Authentication API calls
│   │   └── register.js         # Registration API calls
│   ├── css/
│   │   ├── style.css           # Custom styles
│   │   └── New Text Document.txt
│   ├── js/
│   │   ├── script.js           # General scripts
│   │   └── new folder/         # Additional files
│   └── vercel.json             # Vercel deployment config
├── project/                    # Project documentation/misc
└── README.md                   # This file
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd study-tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install root dependencies** (if any)
   ```bash
   cd ..
   npm install
   ```

4. **Configure environment variables** (optional)
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=4000
   JWT_SECRET=your-secret-key-change-this
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_API_KEY=your-google-api-key
   ```

5. **Start the development server**
   ```bash
   cd backend
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:4000`

## 📖 Usage

### First Time Setup
1. Visit the landing page at `http://localhost:4000`
2. Click "Login" and then "Register" to create an account
3. After registration, log in with your credentials
4. Access the dashboard to explore all features

### Key Workflows

#### Task Management
- Navigate to "Tasks" from the sidebar
- Add new tasks with descriptions and deadlines
- Mark tasks as completed
- View task progress on the dashboard

#### Notes System
- Go to "Notes" section
- Write and save personal notes
- Use AI assistant to generate structured notes on topics

#### AI Assistant
- Access "Assistant" from the sidebar
- Ask questions about study techniques
- Request summaries of text content
- Get YouTube search suggestions
- Generate study notes and project ideas

#### Attendance Tracking
- Use "Attendance" to log study sessions
- View attendance history and statistics

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user info
- `POST /api/logout` - User logout

### Data Management
- `GET /api/data` - Get user data (notes, attendance, calculator)
- `POST /api/data` - Save user data

### AI Assistant
- `POST /api/assistant` - Interact with AI assistant
  - Actions: `summary`, `notes`, `ideas`, `youtube`
  - Supports conversation history

### Contact
- `POST /api/contact` - Submit contact form

### Utility
- `GET /api/health` - Health check
- `GET /api/_debug/users` - Debug endpoint (development only)

## 🔧 Development

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server (same as start for now)

### Building for Production
The application serves static files directly from the `fornted/` directory. For production deployment:

1. Set environment variables for security
2. Consider using a database instead of file storage
3. Configure proper email service for contact forms
4. Set up proper logging and monitoring

### Code Style
- Uses ES6+ JavaScript features
- Follows Express.js best practices
- Frontend uses modern HTML5 and CSS3
- Responsive design with mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Test all features thoroughly
- Follow existing code patterns
- Add comments for complex logic
- Ensure responsive design works on all devices
- Test API endpoints with tools like Postman

## 📄 License

This project is licensed under the ISC License - see the package.json files for details.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- AI powered by [OpenAI](https://openai.com/) and [Google AI](https://ai.google/)

## 📞 Support

For support, please use the contact form within the application or create an issue in the repository.

---

**Note**: This is a demo application with file-based storage. For production use, consider implementing a proper database and additional security measures." 

