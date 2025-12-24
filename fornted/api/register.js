module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Parse JSON body
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Default role: student, admin emails can be: admin@example.com or teacher@example.com
    let userRole = role || 'student';
    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('teacher')) {
      userRole = 'admin';
    }

    // TODO: Hook up to real DB/service. For now, mock success with role.
    return res.status(200).json({ ok: true, message: 'Registered successfully', user: { name, email, role: userRole } });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


