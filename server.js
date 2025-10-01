// Simple Node web service for Render
const express = require('express');
const path = require('path');

const app = express();
const root = path.join(__dirname, 'Fracture_Realms_Full_v2');

// Serve static game files
app.use(express.static(root, {
  extensions: ['html'],
  maxAge: 0,
  etag: false,
}));

// Fallback to index.html (safe even if you don't use client-side routing)
app.get('*', (_req, res) => res.sendFile(path.join(root, 'index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Fracture Realms running on http://localhost:${port}`);
});
