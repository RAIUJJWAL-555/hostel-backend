
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const dropIndex = async () => {
    await connectDB();

    try {
        const collection = mongoose.connection.collection('rooms');
        // List indexes to confirm name
        const indexes = await collection.indexes();
        console.log("Current Indexes:", indexes);

        const indexName = "roomNumber_1"; 
        
        // Check if index exists before trying to drop
        const indexExists = indexes.some(idx => idx.name === indexName);

        if (indexExists) {
            await collection.dropIndex(indexName);
            console.log(`✅ Index '${indexName}' dropped successfully!`);
        } else {
            console.log(`ℹ️ Index '${indexName}' not found. It might have been already dropped.`);
        }
    } catch (error) {
        console.error("❌ Error dropping index:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

dropIndex();
