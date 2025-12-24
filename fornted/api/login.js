module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Mock auth: accept any non-empty creds with role support
    // Default role: student, admin emails can be: admin@example.com or teacher@example.com
    let userRole = role || 'student';
    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('teacher')) {
      userRole = 'admin';
    }

    const user = { 
      email, 
      name: email.split('@')[0] || 'User',
      role: userRole
    };
    const token = 'mock-token-' + Buffer.from(email).toString('hex').slice(0, 12);

    return res.status(200).json({ ok: true, user, token });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


