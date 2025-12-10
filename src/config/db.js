import mongoose from 'mongoose';

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('❌ FATAL ERROR: MONGO_URI environment variable is not set.');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {}); 
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ Mongo Error:', err);
        process.exit(1); 
    }
};

export default connectDB;

