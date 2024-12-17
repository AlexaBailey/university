import express from "express";
import {
  getAllTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSubjects,
  addTeacherSubject,
  updateTeacherSubject,
  deleteTeacherSubject,
  getTeacherSchedule,
  addTeacherSchedule,
  updateTeacherSchedule,
  deleteTeacherSchedule,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);
router.post("/", addTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

router.get("/:id/subjects", getTeacherSubjects);
router.post("/:id/subjects", addTeacherSubject);
router.put("/:id/subjects/:subjectRecordId", updateTeacherSubject);
router.delete("/:id/subjects/:subjectRecordId", deleteTeacherSubject);

router.get("/:id/schedule", getTeacherSchedule);
router.post("/:id/schedule", addTeacherSchedule);
router.put("/:id/schedule/:scheduleRecordId", updateTeacherSchedule);
router.delete("/:id/schedule/:scheduleRecordId", deleteTeacherSchedule);

export default router;
