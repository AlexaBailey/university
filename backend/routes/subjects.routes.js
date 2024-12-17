import express from "express";
import { getAllSubjects } from "../controllers/subjects.controller.js";

const router = express.Router();

router.get("/", getAllSubjects);

export default router;
