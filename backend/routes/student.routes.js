import express from "express";
import {
  getAllStudents,
  getStudentById,
  getStudentGrades,
  addStudent,
  updateStudent,
  deleteStudent,
  downloadStudentRecordById,
} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);

router.get("/:id/grades", getStudentGrades);

router.post("/", addStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/:id/download", downloadStudentRecordById);
export default router;
