import express from "express";
import {
  addSubject,
  deleteSubject,
  getAllSubjects,
  updateSubject,
} from "../controllers/subjects.controller.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.post("/", addSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
