// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import connectDB from './src/config/db.js';

// import studentRoutes from './src/routes/studentRoutes.js';
// import adminRoutes from './src/routes/adminRoutes.js';
// import hostelRoutes from './src/routes/hostelRoutes.js';

// const app = express();

// app.use(cors());
// app.use(express.json());

// connectDB();

// app.use('/api/student', studentRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/hostel', hostelRoutes);

// // ✅ Export for Vercel
// export default app;

// // ✅ Only run server locally
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT,'0.0.0.0', () =>
//     console.log(`🚀 Server running locally on http://localhost:${PORT}`)
//   );
// }
// Old line: import 'dotenv/config'; - DELETE THIS LINE

import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';

import studentRoutes from './src/routes/studentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import hostelRoutes from './src/routes/hostelRoutes.js';

// ✅ Load dotenv only when NOT in production
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

const app = express();

// ✅ --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://myhosty.netlify.app',
  'https://myhosty.netlify.app/'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  methods: 'GET,POST,PUT,DELETE,PATCH,HEAD',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ --- Connect to MongoDB ---
connectDB();

// ✅ --- API Routes ---
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostel', hostelRoutes);

// ✅ --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hostel Backend API is running and healthy!',
  });
});

// ✅ --- Global Error Handler (Optional, good practice) ---
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      status: 'fail',
      message: 'CORS policy blocked this request',
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

// ✅ --- Start the server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
