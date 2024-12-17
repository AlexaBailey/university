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
    console.log(error);
    res.status(500).send("Error reading teachers data: " + error.message);
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    const teacher = teachers.find((t) => t.id === req.params.id);
    if (!teacher) return res.status(404).send("Teacher not found");
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
      subject_id: parseInt(req.body.subject_id),
    };
    subjects.push(newSubject);
    await saveJsonToTxtFile(TEACHERS_SUBJECTS_FILE, subjects);
    res.status(201).send("Subject added successfully");
  } catch (error) {
    res.status(500).send("Error adding subject: " + error.message);
  }
};

export const updateTeacherSubject = async (req, res) => {
  try {
    const subjects = await readTxtFileAsJson(TEACHERS_SUBJECTS_FILE);
    const recordId = req.params.subjectRecordId;
    const index = subjects.findIndex((s) => s.recordId === recordId);

    if (index === -1) return res.status(404).send("Subject not found");

    subjects[index] = { ...subjects[index], ...req.body };
    await saveJsonToTxtFile(TEACHERS_SUBJECTS_FILE, subjects);
    res.send("Subject updated successfully");
  } catch (error) {
    res.status(500).send("Error updating subject: " + error.message);
  }
};

export const deleteTeacherSubject = async (req, res) => {
  try {
    const subjects = await readTxtFileAsJson(TEACHERS_SUBJECTS_FILE);
    const recordId = req.params.subjectRecordId;
    const filteredSubjects = subjects.filter((s) => s.recordId !== recordId);

    if (filteredSubjects.length === subjects.length)
      return res.status(404).send("Subject not found");

    await saveJsonToTxtFile(TEACHERS_SUBJECTS_FILE, filteredSubjects);
    res.send("Subject deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting subject: " + error.message);
  }
};

export const getTeacherSchedule = async (req, res) => {
  try {
    const schedule = await readTxtFileAsJson(TEACHERS_SCHEDULE_FILE);
    const teacherSchedule = schedule.filter(
      (entry) => entry.teacherId === req.params.id
    );
    res.send(teacherSchedule);
  } catch (error) {
    res.status(500).send("Error retrieving schedule: " + error.message);
  }
};

export const addTeacherSchedule = async (req, res) => {
  try {
    const schedule = await readTxtFileAsJson(TEACHERS_SCHEDULE_FILE);
    const newSchedule = {
      recordId: schedule.length
        ? parseInt(schedule[schedule.length - 1].recordId) + 1
        : 1,
      teacherId: parseInt(req.params.id),
      day: req.body.day,
      time: req.body.time,
      subjectId: parseInt(req.body.subjectId),
    };
    schedule.push(newSchedule);
    await saveJsonToTxtFile(TEACHERS_SCHEDULE_FILE, schedule);
    res.status(201).send("Schedule added successfully");
  } catch (error) {
    res.status(500).send("Error adding schedule: " + error.message);
  }
};

export const updateTeacherSchedule = async (req, res) => {
  try {
    const schedule = await readTxtFileAsJson(TEACHERS_SCHEDULE_FILE);
    const recordId = req.params.scheduleRecordId;
    const index = schedule.findIndex((s) => s.recordId === recordId);

    if (index === -1) return res.status(404).send("Schedule not found");

    schedule[index] = { ...schedule[index], ...req.body };
    await saveJsonToTxtFile(TEACHERS_SCHEDULE_FILE, schedule);
    res.send("Schedule updated successfully");
  } catch (error) {
    res.status(500).send("Error updating schedule: " + error.message);
  }
};

export const deleteTeacherSchedule = async (req, res) => {
  try {
    const schedule = await readTxtFileAsJson(TEACHERS_SCHEDULE_FILE);
    const recordId = req.params.scheduleRecordId;
    const filteredSchedule = schedule.filter((s) => s.recordId != recordId);

    if (filteredSchedule.length === schedule.length)
      return res.status(404).send("Schedule not found");

    await saveJsonToTxtFile(TEACHERS_SCHEDULE_FILE, filteredSchedule);
    res.send("Schedule deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting schedule: " + error.message);
  }
};

export const addTeacher = async (req, res) => {
  try {
    const teachers = await readTxtFileAsJson(TEACHERS_FILE);
    const newTeacher = {
      id: teachers.length ? parseInt(teachers[teachers.length - 1].id) + 1 : 1,
      ...req.body,
    };
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
    const id = req.params.id;
    const filteredTeachers = teachers.filter((t) => t.id !== id);

    if (filteredTeachers.length === teachers.length)
      return res.status(404).send("Teacher not found");

    await saveJsonToTxtFile(TEACHERS_FILE, filteredTeachers);
    res.send("Teacher deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting teacher: " + error.message);
  }
};
