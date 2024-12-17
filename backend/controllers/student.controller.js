import {
  STUDENTS_FILE,
  STUDENTS_GRADES_FILE,
  SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";

export const getAllStudents = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    res.send(students);
  } catch (error) {
    res.status(500).send("Error reading students data: " + error.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const student = students.find((s) => s.id === req.params.id);
    if (!student) return res.status(404).send("Student not found");
    res.send(student);
  } catch (error) {
    res.status(500).send("Error retrieving student: " + error.message);
  }
};

export const getStudentGrades = async (req, res) => {
  try {
    const grades = await readTxtFileAsJson(STUDENTS_GRADES_FILE);
    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);

    const studentGrades = grades
      .filter((grade) => grade.studentId === req.params.id)
      .map((grade) => {
        const subject = subjects.find(
          (sub) => sub.subject_id === grade.subject_id
        );
        return {
          ...grade,
          subject_name: subject ? subject.subject_name : "Unknown",
        };
      });

    if (!studentGrades.length)
      return res.status(404).send("No grades found for this student.");

    res.send(studentGrades);
  } catch (error) {
    res.status(500).send("Error retrieving student grades: " + error.message);
  }
};
export const addStudentGrade = async (req, res) => {
  try {
    const grades = await readTxtFileAsJson(STUDENTS_GRADES_FILE);
    const newGrade = {
      recordId: grades.length
        ? parseInt(grades[grades.length - 1].recordId) + 1
        : 1,
      studentId: parseInt(req.params.id),
      ...req.body,
    };
    grades.push(newGrade);
    await saveJsonToTxtFile(STUDENTS_GRADES_FILE, grades);
    res.status(201).send("Grade added successfully");
  } catch (error) {
    res.status(500).send("Error adding grade: " + error.message);
  }
};

export const addStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const newStudent = req.body;
    newStudent.id = students.length
      ? parseInt(students[students.length - 1].id) + 1
      : 1;
    students.push(newStudent);
    await saveJsonToTxtFile(STUDENTS_FILE, students);
    res.status(201).send("Student added successfully");
  } catch (error) {
    res.status(500).send("Error adding student: " + error.message);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const id = req.params.id;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).send("Student not found");
    students[index] = { ...students[index], ...req.body };
    await saveJsonToTxtFile(STUDENTS_FILE, students);
    res.send("Student updated successfully");
  } catch (error) {
    res.status(500).send("Error updating student: " + error.message);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const id = parseInt(req.params.id);
    const filteredStudents = students.filter((s) => s.id !== id);
    if (students.length === filteredStudents.length)
      return res.status(404).send("Student not found");
    await saveJsonToTxtFile(STUDENTS_FILE, filteredStudents);
    res.send("Student deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting student: " + error.message);
  }
};
