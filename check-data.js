require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Note = require('./models/Note');
const Attendance = require('./models/Attendance');

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const userCount = await User.countDocuments();
    const taskCount = await Task.countDocuments();
    const noteCount = await Note.countDocuments();
    const attendanceCount = await Attendance.countDocuments();

    console.log('DATABASE STATISTICS');
    console.log('===================');
    console.log('Users:', userCount);
    console.log('Tasks:', taskCount);
    console.log('Notes:', noteCount);
    console.log('Attendance:', attendanceCount);
    console.log('\n');

    if (userCount > 0) {
      console.log('USERS:');
      const users = await User.find().select('name email role');
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
      console.log('\n');
    }

    if (taskCount > 0) {
      console.log('TASKS:');
      const tasks = await Task.find().populate('userId', 'name');
      tasks.forEach((task, i) => {
        console.log(`${i + 1}. ${task.text} - ${task.status} (${task.priority})`);
        console.log(`   User: ${task.userId?.name || 'Unknown'}`);
      });
      console.log('\n');
    }

    if (noteCount > 0) {
      console.log('NOTES:');
      const notes = await Note.find().populate('userId', 'name');
      notes.forEach((note, i) => {
        const preview = note.text.substring(0, 50);
        console.log(`${i + 1}. ${preview}...`);
        console.log(`   User: ${note.userId?.name || 'Unknown'}`);
      });
      console.log('\n');
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();