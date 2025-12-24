const fetch = require('node-fetch'); // Ensure node-fetch is installed for server-side fetch

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, action, topic, text, history, userRole, relevantNotes } = req.body || {};

    // OpenAI API configuration
    const OPENAI_API_KEY = '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'; // Use env var in production
    const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    // Build system prompt based on rules
    function buildSystemPrompt(action = null, relevantNotes = '') {
      let prompt = `You are an AI Study Assistant integrated into a Study Goal Tracker web application. Your role is to help students learn efficiently, not just give answers.

When a student provides a topic, YouTube link, or problem, follow these rules:

1. YouTube Study Support
If a topic is given, suggest relevant educational YouTube videos.
Focus only on learning-oriented content (tutorials, lectures, explanations).
Prefer clear, beginner-friendly videos.

2. Notes Generation
Convert video or topic content into structured study notes.
Use:
Clear headings
Bullet points
Simple language
Examples where helpful

3. Notes Summary (Revision Mode)
Provide a concise summary of the notes.
Highlight:
Key concepts
Important formulas or steps
Exam-relevant points

4. Problem Solving & Guidance
When a problem is provided:
First explain the concept involved
Then solve the problem step by step
Guide the student logically instead of jumping to the final answer

5. Teaching Style Rules
Be clear, patient, and educational
Avoid unnecessary complexity
Do not assume prior knowledge unless stated
Encourage understanding over memorization

Output Format
Use headings and bullet points
Keep explanations short but complete
Maintain a student-friendly tone`;

      if (action) {
        prompt += `\n\nSpecific Action: ${action}`;
      }
      if (relevantNotes) {
        prompt += `\n\nRelevant Notes from User's Saved Data:\n${relevantNotes}`;
      }
      return prompt;
    }

    // Function to call OpenAI with retry on 429
    async function callOpenAI(messages, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: messages,
              max_tokens: 1000,
              temperature: 0.7
            })
          });

          if (response.status === 429) {
            const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry
          }

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          return data.choices[0].message.content.trim();
        } catch (error) {
          if (i === retries - 1) throw error; // Last retry failed
        }
      }
    }

    // Prepare messages for OpenAI
    const systemPrompt = buildSystemPrompt(action, relevantNotes);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: `User Role: ${userRole || 'student'}\n${message || `Action: ${action}, Topic/Text: ${topic || text || 'N/A'}`}` }
    ];

    const reply = await callOpenAI(messages);

    // Handle YouTube action with links (mock links for now, as OpenAI doesn't provide real links)
    if (action === 'youtube') {
      const links = [
        { title: `${topic} - Tutorial 1`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}` },
        { title: `${topic} - Tutorial 2`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}` }
      ];
      return res.status(200).json({ reply, links });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
