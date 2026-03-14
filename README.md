# Study Goal Tracker

The Study Goal Tracker is a full-stack web application designed to help students and teachers manage academic activities efficiently. It offers a clean, responsive UI with specific features for both roles, secure API routes, real-time data integration, and built-in tools like an AI Assistant and Calculator.

## Features

- **Role-Based Workflows**: Tailored user experiences for `student`, `teacher`, and `admin` roles.
- **Dynamic Dashboard**: Central hub featuring performance charts, attendance summaries, task completion, and note tracking.
- **Tasks Management**: Create, update, and track study tasks with priority and deadline management.
- **Notes System**: Write and securely store personal study notes.
- **Attendance Tracking**: Automatically records daily login and logout activity to calculate attendance percentage.
- **Admin & Teacher Views**: View all registered students and system-wide statistics.
- **Integrated AI Assistant**: Ask study-related questions or generate project ideas.
- **Built-in Calculator**: Convenient access to a calculator without leaving the app.

## Technologies Used

- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript, FontAwesome, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs for password hashing

## Project Structure

- `server.js`: The main Express server file containing API routes.
- `config/database.js`: MongoDB connection setup.
- `models/`: Mongoose schemas for User, Task, Note, and Attendance.
- `public/`: Frontend HTML, CSS, and JS files (including `dashboard.html`, `login.html`, etc.).

## Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/prasad-prince/study-tracker-.git
   cd study-tracker-
   ```

2. **Backend Setup**:
   Navigate to the `backend` directory (if applicable, or stay in the root if `server.js` is there).
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the same directory as `server.js` with the following variables:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the server**:
   ```bash
   npm start
   # or
   node server.js
   ```

5. **Access the application**:
   Open a browser and go to `http://localhost:4000` (or whichever port is defined).

## Development

- Start by registering a new account.
- Note that the first registered user can be modified in the database to have the `admin` or `teacher` role to test administrative features.

## License

This project is intended for educational purposes.