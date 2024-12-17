import express from "express";
import bodyParser from "body-parser";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import examsRoutes from "./routes/exam.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js";

import cors from "cors";
const app = express();
const PORT = 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/subjects", subjectsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
