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

// Load dotenv only when NOT in production
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

const app = express();

// ✅ --- CORS CONFIGURATION UPDATED ---
// Define the list of allowed frontend URLs
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend
  'https://myhosty.netlify.app' // Your live Netlify frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// Use the new CORS options
app.use(cors(corsOptions));
// --- END OF CORS UPDATE ---


app.use(express.json());

connectDB();

app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostel', hostelRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

