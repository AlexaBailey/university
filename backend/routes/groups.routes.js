import express from "express";
import {
  addGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  assessGroup,
  getStudentsByGroup,
  getGroupLessons,
  addGroupLesson,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", addGroup);
router.get("/", getAllGroups);
router.get("/lessons", getGroupLessons);
router.post("/lessons", addGroupLesson);

router.get("/:id", getGroupById);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.get("/:id/students", getStudentsByGroup);

router.post("/assess", assessGroup);

export default router;
