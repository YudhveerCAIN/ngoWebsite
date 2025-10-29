import mongoose from 'mongoose';

export async function connectToDatabase() {
	const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urjja-pratishthan-dev';
	
	// Database connection options
	const options = {
		serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
		socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
		maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
		retryWrites: true,
		w: 'majority'
	};

	mongoose.set('strictQuery', true);
	
	try {
		await mongoose.connect(mongoUri, options);
		console.log(`Connected to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
		
		// Handle connection events
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});
		
		mongoose.connection.on('disconnected', () => {
			console.warn('MongoDB disconnected');
		});
		
		mongoose.connection.on('reconnected', () => {
			console.log('MongoDB reconnected');
		});
		
	} catch (error) {
		console.error('Failed to connect to MongoDB:', error.message);
		throw error;
	}
}
