import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelDB', {});
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ Mongo Error:', err);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;