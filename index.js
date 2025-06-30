const express = require('express');
const axios = require('axios');
const dayjs = require('dayjs');
require('dotenv').config();

const app = express();
app.use(express.json());

const { TRELLO_KEY, TRELLO_TOKEN } = process.env;

// Mission and Logistics List IDs
const MISSION_LISTS = [
  '6663bbba2e76cb0cdd36d43f', // Today
  '6663bbba2e76cb0cdd36d43e', // Week
];

const LOGISTICS_LISTS = [
  '6663b9ce009f52cbdf0aa940', // Next 2 Weeks
  '6663b9ce009f52cbdf0aa945', // Events & Travel
  '6663b9ce009f52cbdf0aa942', // Recurring Tasks
  '6663b9ce009f52cbdf0aa943', // Family Rhythm
  '6663b9ce009f52cbdf0aa944', // Chores
];

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

// Advisor route: Should I schedule on this day?
app.get('/advisor/should_schedule_on', async (req, res) => {
  const { date } = req.query;

  console.log(`Advisor route hit with date: ${date}`);

  if (!date) return res.status(400).json({ error: 'Missing date param (YYYY-MM-DD)' });

  const listIds = [...MISSION_LISTS, ...LOGISTICS_LISTS];
  const tasks = [];

  try {
    for (const listId of listIds) {
      const { data } = await axios.get(`https://api.trello.com/1/lists/${listId}/cards`, {
        params: {
          key: TRELLO_KEY,
          token: TRELLO_TOKEN
        }
      });

      data.forEach(card => {
        tasks.push({
          name: card.name,
          due: card.due ? dayjs(card.due).format('YYYY-MM-DD') : null,
          listId
        });
      });
    }

    // Filter tasks for the specified date
    const tasksOnDay = tasks.filter(t => t.due === date);

    // Advisor logic
    let message;
    if (tasksOnDay.length === 0) {
      message = `✅ ${date} looks clear. You're good to schedule something.`;
    } else if (tasksOnDay.length <= 2) {
      message = `⚠️ ${date} has a few tasks (${tasksOnDay.length}): ${tasksOnDay.map(t => t.name).join(', ')}. You *might* want to keep margin.`;
    } else {
      message = `❌ ${date} already has ${tasksOnDay.length} tasks: ${tasksOnDay.map(t => t.name).join(', ')}. I recommend leaving it open.`;
    }

    res.json({
      date,
      tasks: tasksOnDay,
      message
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MCP Server listening on port ${PORT}`));
