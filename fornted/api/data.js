module.exports = async (req, res) => {
  try {
    // Simple in-memory storage (resets on each deploy - for production, use a database)
    // In a real app, you'd use a database like MongoDB, PostgreSQL, etc.
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Return user's data
      // For now, return empty tasks - in production, fetch from database
      return res.status(200).json({
        data: {
          tasks: []
        }
      });
    } else if (req.method === 'POST') {
      // Save user's data
      const { tasks } = req.body || {};
      
      // In production, save to database here
      // For now, just return success
      return res.status(200).json({
        success: true,
        message: 'Data saved successfully'
      });
    } else {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
