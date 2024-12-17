import express from "express";
import {
  getAllTeachers,
  getTeacherById,
  getTeacherSubjects,
  addTeacherSubject,
  getTeacherSchedule,
  addTeacherSchedule,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);

router.get("/:id/subjects", getTeacherSubjects);
router.post("/:id/subjects", addTeacherSubject);

router.get("/:id/schedule", getTeacherSchedule);
router.post("/:id/schedule", addTeacherSchedule);

router.post("/", addTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
