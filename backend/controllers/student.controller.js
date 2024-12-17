import {
  STUDENTS_FILE,
  STUDENTS_GRADES_FILE,
  STUDENTS_GROUPS_FILE,
  SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";

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

export const getAllStudents = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const studentsWithGroups = students.map((student) => {
      const group = studentGroups.find((g) => g.studentId === student.id);
      return {
        ...student,
        groupId: group ? group.groupId : null,
      };
    });

    res.send(studentsWithGroups);
  } catch (error) {
    res.status(500).send("Error reading students data: " + error.message);
  }
};

// Get a single student with group ID
export const getStudentById = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const student = students.find((s) => s.id === req.params.id);
    if (!student) return res.status(404).send("Student not found");

    const group = studentGroups.find((g) => g.studentId === student.id);
    res.send({ ...student, groupId: group ? group.groupId : null });
  } catch (error) {
    res.status(500).send("Error retrieving student: " + error.message);
  }
};

// Add a new student and associate a group ID
export const addStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const newStudent = req.body;
    const newId = students.length
      ? parseInt(students[students.length - 1].id) + 1
      : 1;

    students.push({ id: newId, ...newStudent });
    if (req.body.groupId) {
      studentGroups.push({
        recordId: studentGroups.length
          ? parseInt(studentGroups[studentGroups.length - 1].recordId) + 1
          : 1,
        studentId: newId,
        groupId: req.body.groupId,
      });
    }

    await saveJsonToTxtFile(STUDENTS_FILE, students);
    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, studentGroups);

    res.status(201).send("Student added successfully");
  } catch (error) {
    res.status(500).send("Error adding student: " + error.message);
  }
};

// Update student and group association
export const updateStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const id = req.params.id;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).send("Student not found");

    students[index] = { ...students[index], ...req.body };

    if (req.body.groupId) {
      const groupIndex = studentGroups.findIndex((g) => g.studentId === id);
      if (groupIndex !== -1) {
        studentGroups[groupIndex].groupId = req.body.groupId;
      } else {
        studentGroups.push({
          recordId: studentGroups.length
            ? parseInt(studentGroups[studentGroups.length - 1].recordId) + 1
            : 1,
          studentId: id,
          groupId: req.body.groupId,
        });
      }
    }

    await saveJsonToTxtFile(STUDENTS_FILE, students);
    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, studentGroups);

    res.send("Student updated successfully");
  } catch (error) {
    res.status(500).send("Error updating student: " + error.message);
  }
};

// Delete a student and remove group association
export const deleteStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const id = req.params.id;
    const filteredStudents = students.filter((s) => s.id !== id);
    const filteredGroups = studentGroups.filter((g) => g.studentId !== id);

    if (students.length === filteredStudents.length)
      return res.status(404).send("Student not found");

    await saveJsonToTxtFile(STUDENTS_FILE, filteredStudents);
    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, filteredGroups);

    res.send("Student deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting student: " + error.message);
  }
};
