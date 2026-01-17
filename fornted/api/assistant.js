// api/assistant.js - Updated for Vercel serverless
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from Vercel environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured' 
      });
    }

    // Parse request body
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    const { 
      message, 
      topic, 
      text, 
      action,
      history = [],
      relevantNotes = '',
      userRole = 'student'
    } = body;

    // Determine the user's question
    let userQuestion = '';
    
    if (message) {
      userQuestion = message;
    } else if (topic && action === 'ideas') {
      userQuestion = `Suggest 2-3 project ideas for: ${topic}`;
    } else if (topic && action === 'notes') {
      userQuestion = `Provide study notes about: ${topic}`;
    } else if (topic && action === 'youtube') {
      userQuestion = `What are the key topics to learn about ${topic} for YouTube tutorials?`;
    } else if (text && action === 'summary') {
      userQuestion = `Summarize this: ${text.substring(0, 500)}`;
    } else if (topic) {
      userQuestion = topic;
    } else if (text) {
      userQuestion = text;
    } else {
      return res.status(400).json({ error: 'No question provided' });
    }

    // Build system prompt
    const systemPrompt = `You are a helpful study assistant. Answer in simple, clear language.
Keep responses concise and educational. After your answer, add 2-3 related points.
${relevantNotes ? `User's notes for context: ${relevantNotes.substring(0, 500)}` : ''}`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5).map(item => ({
        role: item.role === 'user' ? 'user' : 'assistant',
        content: item.content.substring(0, 300)
      })),
      { role: 'user', content: userQuestion.substring(0, 1000) }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ 
        error: 'OpenAI API error',
        details: response.statusText 
      });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content?.trim() || 'No response generated.';

    // Prepare response
    const result = { reply };

    // Add YouTube links if requested
    if (action === 'youtube' && topic) {
      const searchTerm = encodeURIComponent(topic);
      result.links = [
        {
          title: `Search ${topic} on YouTube`,
          url: `https://www.youtube.com/results?search_query=${searchTerm}`,
          icon: 'youtube'
        }
      ];
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.' 
    });
  }
};