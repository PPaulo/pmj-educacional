import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static React files from 'dist' directory
app.use(express.static(join(__dirname, 'dist')));

// SPA Fallback for matching URLs directly in React Router
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
