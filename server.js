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

// ✅ NEW: Only load dotenv when NOT in production (i.e., on your laptop)
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

const app = express();

// ... (rest of your server.js code remains the same)
// ... middleware, routes, app.listen, etc.
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostel', hostelRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

