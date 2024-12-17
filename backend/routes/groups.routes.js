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
} from "../controllers/group.controller.js";

const router = express.Router();

// Group CRUD
router.post("/", addGroup); // Create a new group
router.get("/", getAllGroups);
router.get("/lessons", getGroupLessons);
// Get all groups
router.get("/:id", getGroupById); // Get group by ID
router.put("/:id", updateGroup); // Update group by ID
router.delete("/:id", deleteGroup); // Delete group by ID
router.get("/:id/students", getStudentsByGroup);

router.post("/assess", assessGroup); // Assess group for a lesson

export default router;
