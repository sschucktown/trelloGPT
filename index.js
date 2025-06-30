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

const EXCLUDED_LIST_NAMES = ['monthly', 'quarterly', 'annual', 'yearly', 'not this week', 'backlog'];

// Root
