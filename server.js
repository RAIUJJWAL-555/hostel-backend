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
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';

import studentRoutes from './src/routes/studentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import hostelRoutes from './src/routes/hostelRoutes.js';

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
connectDB();

// --- API Routes ---
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostel', hostelRoutes);

// --- Server Startup ---
// ❌ We removed the `if` condition and the `export default app;`
// ✅ This will now run on both your local machine and on Railway.
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
