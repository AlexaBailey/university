import express from "express";
import {
  getAllExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  getAllExamResults,
  addExamResult,
} from "../controllers/exam.controler.js";

const router = express.Router();

router.get("/", getAllExams);
router.post("/", addExam);

router.get("/results", getAllExamResults);
router.post("/results", addExamResult);

router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router;
