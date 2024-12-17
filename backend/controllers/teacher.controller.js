import {
  TEACHERS_FILE,
  TEACHERS_SCHEDULE_FILE,
  TEACHERS_SUBJECTS_FILE,
  SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    res.send(teachers);
  } catch (error) {
    res.status(500).send("Error reading teachers data: " + error.message);
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    const teacher = teachers.find((t) => t.id === req.params.id);
    console.log(req.params.id, teachers);
    if (!teacher) return res.status(404).send("Teacher not found");
    console.log(req.query.id, teacher);
    res.send(teacher);
  } catch (error) {
    res.status(500).send("Error retrieving teacher: " + error.message);
  }
};

export const getTeacherSubjects = async (req, res) => {
  try {
    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);
    const teacherSubjects = await readTxtFileAsJson(TEACHERS_SUBJECTS_FILE);

    const result = teacherSubjects
      .filter((ts) => ts.teacherId === req.params.id)
      .map((ts) => {
        const subject = subjects.find(
          (sub) => sub.subject_id === ts.subject_id
        );
        return {
          ...ts,
          subject_name: subject ? subject.subject_name : "Unknown",
        };
      });

    if (!result.length)
      return res.status(404).send("No subjects found for this teacher.");
    res.send(result);
  } catch (error) {
    res.status(500).send("Error retrieving teacher subjects: " + error.message);
  }
};

export const addTeacherSubject = async (req, res) => {
  try {
    const subjects = await readTxtFileAsJson(TEACHERS_SUBJECTS_FILE);
    const newSubject = {
      recordId: subjects.length
        ? parseInt(subjects[subjects.length - 1].recordId) + 1
        : 1,
      teacherId: parseInt(req.params.id),
      ...req.body,
    };
    console.log(newSubject, subjects);
    subjects.push(newSubject);
    await saveJsonToTxtFile(TEACHERS_SUBJECTS_FILE, subjects);
    res.status(201).send("Subject added successfully");
  } catch (error) {
    res.status(500).send("Error adding subject: " + error.message);
  }
};

export const getTeacherSchedule = async (req, res) => {
  try {
    const schedules = await readTxtFileAsJson(TEACHERS_SCHEDULE_FILE);
    const teacherSchedules = schedules.filter(
      (schedule) => schedule.teacherId === req.params.id
    );
    if (!teacherSchedules.length)
      return res.status(404).send("No schedule found for this teacher.");
    res.send(teacherSchedules);
  } catch (error) {
    res.status(500).send("Error retrieving teacher schedule: " + error.message);
  }
};

export const addTeacherSchedule = async (req, res) => {
  try {
    const schedules = await readTxtFileAsJson(TEACHERS_SCHEDULE_FILE);
    const newSchedule = {
      recordId: schedules.length
        ? parseInt(schedules[schedules.length - 1].recordId) + 1
        : 1,
      teacherId: parseInt(req.params.id),
      ...req.body,
    };
    schedules.push(newSchedule);
    await saveJsonToTxtFile(TEACHERS_SCHEDULE_FILE, schedules);
    res.status(201).send("Schedule added successfully");
  } catch (error) {
    res.status(500).send("Error adding schedule: " + error.message);
  }
};

export const addTeacher = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    const newTeacher = req.body;
    newTeacher.id = teachers.length
      ? parseInt(teachers[teachers.length - 1].id, 10) + 1
      : 1;
    teachers.push(newTeacher);
    await saveJsonToTxtFile(TEACHERS_FILE, teachers);
    res.status(201).send("Teacher added successfully");
  } catch (error) {
    res.status(500).send("Error adding teacher: " + error.message);
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    const id = req.params.id;
    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) return res.status(404).send("Teacher not found");
    teachers[index] = { ...teachers[index], ...req.body };
    await saveJsonToTxtFile(TEACHERS_FILE, teachers);
    res.send("Teacher updated successfully");
  } catch (error) {
    res.status(500).send("Error updating teacher: " + error.message);
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    const id = parseInt(req.params.id);
    const filteredTeachers = teachers.filter((t) => t.id !== id);
    if (teachers.length === filteredTeachers.length)
      return res.status(404).send("Teacher not found");
    await saveJsonToTxtFile(TEACHERS_FILE, filteredTeachers);
    res.send("Teacher deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting teacher: " + error.message);
  }
};
