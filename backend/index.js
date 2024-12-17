// server.js
import express from "express";
import bodyParser from "body-parser";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/teachers", teacherRoutes);
app.use("/students", studentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
