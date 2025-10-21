// import mongoose from 'mongoose';

// const connectDB = async () => {

//     console.log("Attempting to connect with MONGO_URI:", process.env.MONGO_URI);

//     try {
//         await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelDB', {});
//         console.log('✅ MongoDB Connected');
//     } catch (err) {
//         console.error('❌ Mongo Error:', err);
//         process.exit(1); // Exit process with failure
//     }
// };

// export default connectDB;
import mongoose from 'mongoose';

const connectDB = async () => {
    // Get the URI from environment variables
    const MONGO_URI = process.env.MONGO_URI;

    // ✅ NEW: Add a check to ensure the variable exists
    if (!MONGO_URI) {
        console.error('❌ FATAL ERROR: MONGO_URI environment variable is not set.');
        process.exit(1);
    }
    
    // We removed the || 'localhost...' fallback

    try {
        // ✅ Connect using only the variable
        await mongoose.connect(MONGO_URI, {}); 
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ Mongo Error:', err);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;

