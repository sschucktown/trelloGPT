const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { TRELLO_KEY, TRELLO_TOKEN } = process.env;

app.get('/', (req, res) => {
  res.send('✅ MCP Server is running.');
});

// Get all cards from a Trello list
app.get('/trello/cards/:listId', async (req, res) => {
  const { listId } = req.params;
  try {
    const { data } = await axios.get(`https://api.trello.com/1/lists/${listId}/cards`, {
      params: {
        key: TRELLO_KEY,
        token: TRELLO_TOKEN
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a card in a Trello list
app.post('/trello/cards', async (req, res) => {
  const { name, desc, idList } = req.body;
  try {
    const { data } = await axios.post(
      'https://api.trello.com/1/cards',
      null,
      {
        params: {
          name,
          desc,
          idList,
          key: TRELLO_KEY,
          token: TRELLO_TOKEN
        }
      }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MCP Server listening on port ${PORT}`));
