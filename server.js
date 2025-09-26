import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import events from './lib/events.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get the pairing code
app.post('/api/get-code', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const requestId = randomUUID();

    // Listen for the response event
    events.once(`get-code-response:${requestId}`, ({ code, error }) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ code });
    });

    // Emit the request event for the bot to handle
    events.emit('get-code-request', { phoneNumber, requestId });
});

import ws from 'ws';

// API endpoint to get bot status
app.get('/api/bots-status', (req, res) => {
    const activeSubBots = global.conns ? global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED).length : 0;
    const totalBots = activeSubBots + 1; // +1 for the main bot
    res.json({ totalBots });
});

// API endpoint to set prefix
app.post('/api/set-prefix', async (req, res) => {
    const { phoneNumber, prefix } = req.body;
    if (!phoneNumber || !prefix) {
        return res.status(400).json({ error: 'Phone number and prefix are required' });
    }

    const requestId = randomUUID();

    // Listen for the response event
    events.once(`set-prefix-response:${requestId}`, ({ message, error }) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ success: true, message });
    });

    // Emit the request event
    events.emit('set-prefix-request', { phoneNumber, prefix, requestId });
});

export default function startServer(port) {
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
    return server;
}