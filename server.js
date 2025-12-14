import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

import studentRoutes from "./src/routes/studentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import hostelRoutes from "./src/routes/hostelRoutes.js";
import noticeRoutes from "./src/routes/noticeRoutes.js";

// Load environment variables only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// CORS configuration for allowed origins
const corsOptions = {
  origin: [
    "http://localhost:5174",
    "http://localhost:5173",
    "https://myhosty.netlify.app",   // Your deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

// --- Middleware ---
app.use(cors(corsOptions));
app.use(express.json());

// --- Database Connection ---
connectDB().then(async () => {
  try {
    const Room = (await import('./src/models/Room.js')).default;
    const collection = Room.collection;
    const indexes = await collection.indexes();
    const indexName = "roomNumber_1"; 
    
    // Check and drop the old unique index if it exists logic
    const indexExists = indexes.some(idx => idx.name === indexName);
    if (indexExists) {
        await collection.dropIndex(indexName);
        console.log(`✅ Startup: Index '${indexName}' dropped successfully!`);
    } else {
        console.log(`ℹ️ Startup: DB Check - Index '${indexName}' is clean.`);
    }
  } catch (err) {
    console.error("⚠️ Startup DB Index Check Error (Non-fatal):", err.message);
  }
});

// --- API Routes ---
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/notices", noticeRoutes);

// --- Health Check Route ---
// A simple route to check if the server is running
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Hostel Backend API is running and healthy!",
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
