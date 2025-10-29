import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectToDatabase } from './config/db.js';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

async function start() {
	try {
		await connectToDatabase();
	} catch (error) {
		console.warn('MongoDB connection failed. Continuing without DB for now. Error:', error?.message || error);
	}

	const server = http.createServer(app);
	server.listen(port, () => {
		console.log(`Backend listening on http://localhost:${port}`);
	});
}

start();
