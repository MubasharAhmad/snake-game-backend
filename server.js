// src/index.js
const express = require('express');
const cors = require('cors');
const db = require('./src/db');
const routes = require('./src/routes');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
