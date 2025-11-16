require("dotenv").config();
require("./jobs/warrantyReminder");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");
const {serveFileForDownload} = require('./controllers/fileController'); // Import the new controller

// Import Routes
const warrantyRoutes = require("./routes/warrantyRoutes");
const authRoutes = require("./routes/authRoutes");
const serviceHistoryRoutes = require("./routes/serviceHistoryRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const testMail = require("./routes/testMail.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/warranties", warrantyRoutes);
app.use("/api/service-history", serviceHistoryRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/testmail", testMail);
app.get('/download', serveFileForDownload);
// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// --- Static Frontend Serve Section ---
const publicPath = path.join(__dirname, "../publicc");
app.use(express.static(publicPath));

// Catch-all route for frontend (except /api paths)
// app.get(/^\/(?!api).*/, (req, res) => {
//   res.sendFile(path.join(publicPath, "index.html"));
// });

//starting the server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
