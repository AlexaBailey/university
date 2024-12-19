import express from "express";
import bodyParser from "body-parser";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import examsRoutes from "./routes/exam.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js";

import cors from "cors";
import { decryptFileAndValidate, encryptFile } from "./utils/crypt.js";
import { ENCRYPTION_KEY } from "./constants/encrypt.js";
import {
  decryptStoredKey,
  encryptAndStoreKey,
} from "./utils/key_encryption.js";
const app = express();
const PORT = 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

const filesToProcess = [
  "assessments.txt",
  "exams_info.txt",
  "exams_results.txt",
  "group_lessons.txt",
  "groups.txt",
  "students_groups.txt",
  "students.txt",
  "subjects.txt",
  "teachers_schedule.txt",
  "teachers_subjects.txt",
  "teachers.txt",
];

const encryptAllFiles = async () => {
  const decryptedKey = await decryptStoredKey("./data/encrypted_key.json");
  for (const file of filesToProcess) {
    await encryptFile(file, decryptedKey);
  }
};

const decryptAndValidateAllFiles = async () => {
  const decryptedKey = await decryptStoredKey("./data/encrypted_key.json");
  for (const file of filesToProcess) {
    const isValid = await decryptFileAndValidate(file, decryptedKey);
    if (!isValid) {
      console.log(`File ${file} failed validation.`);
    }
  }
};

// (async () => {
//   console.log("Starting encryption...");
//   await encryptAllFiles();

//   // console.log("\nStarting decryption and validation...");
//   // await decryptAndValidateAllFiles();

//   console.log("\nProcess completed.");
// })();

// encryptAndStoreKey(ENCRYPTION_KEY, "./data/encrypted_key.json");

app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/subjects", subjectsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
