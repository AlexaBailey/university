import {
  ASSESSMENTS_FILE,
  EXAM_RESULTS_FILE,
  EXAMS_INFO_FILE,
  GROUPS_FILE,
  GROUPS_LESSONS_FILE,
  STUDENTS_FILE,
  STUDENTS_GROUPS_FILE,
  SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";
import { HTTP_STATUS } from "../constants/http.js";

export const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.params.id;

    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);
    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);
    const examsInfo = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const examsResults = await readTxtFileAsJson(EXAM_RESULTS_FILE);

    const studentAssessments = assessments
      .filter((assessment) => assessment.studentId === studentId)
      .map((assessment) => {
        const lesson = groupLessons.find(
          (lesson) => lesson.groupLessonId === assessment.groupLessonId
        );
        const subject = subjects.find(
          (sub) => sub.subject_id === lesson?.subjectId
        );
        return {
          type: "Assessment",
          mark: parseFloat(assessment.mark),
          subject_name: subject ? subject.subject_name : "Unknown",
          date: lesson ? lesson.date : "N/A",
        };
      });

    const studentExams = examsResults
      .filter((examResult) => examResult.studentId === studentId)
      .map((examResult) => {
        const exam = examsInfo.find(
          (exam) => exam.examId === examResult.examId
        );
        const subject = subjects.find(
          (sub) => sub.subject_id === exam?.subjectId
        );
        return {
          type: "Exam",
          mark: parseFloat(examResult.mark),
          subject_name: subject ? subject.subject_name : "Unknown",
          date: exam ? exam.date : "N/A",
        };
      });

    const allRecords = [...studentAssessments, ...studentExams];

    if (allRecords.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No grades, assessments, or exams found for this student.");
    }

    const totalMarks = allRecords.reduce((sum, record) => sum + record.mark, 0);
    const averageMark = (totalMarks / allRecords.length).toFixed(2);

    res.send({
      studentId,
      averageMark,
      records: allRecords,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving student grades: " + error.message);
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
    res.status(HTTP_STATUS.CREATED).send("Grade added successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding grade: " + error.message);
  }
};
export const getAllStudents = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const groups = await readTxtFileAsJson(GROUPS_FILE);

    const studentsWithGroups = students.map((student) => {
      const studentGroup = studentGroups.find(
        (g) => g.studentId === student.id
      );
      const groupData = studentGroup
        ? groups.find((group) => group.groupId == studentGroup.groupId)
        : null;

      return {
        ...student,
        group: groupData || null,
      };
    });

    res.send(studentsWithGroups);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error reading students data: " + error.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const groups = await readTxtFileAsJson(GROUPS_FILE);

    const student = students.find((s) => s.id === req.params.id);
    if (!student)
      return res.status(HTTP_STATUS.NOT_FOUND).send("Student not found");

    const studentGroup = studentGroups.find((g) => g.studentId == student.id);
    const groupData = studentGroup
      ? groups.find((group) => group.groupId === studentGroup.groupId)
      : null;

    res.send({
      ...student,
      group: groupData || null,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving student: " + error.message);
  }
};
export const addStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const validStudents = students.filter(
      (student) => !isNaN(parseInt(student.id))
    );
    const maxId = validStudents.length
      ? Math.max(...validStudents.map((student) => parseInt(student.id)))
      : 0;

    const newId = maxId + 1;
    let { id, ...rest } = req.body;
    const newStudent = { id: newId, ...rest };
    students.push(newStudent);
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

    res.status(HTTP_STATUS.CREATED).send("Student added successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding student: " + error.message);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const id = req.params.id;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1)
      return res.status(HTTP_STATUS.NOT_FOUND).send("Student not found");

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
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating student: " + error.message);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const id = req.params.id;
    const filteredStudents = students.filter((s) => s.id !== id);
    const filteredGroups = studentGroups.filter((g) => g.studentId !== id);

    if (students.length === filteredStudents.length)
      return res.status(HTTP_STATUS.NOT_FOUND).send("Student not found");

    await saveJsonToTxtFile(STUDENTS_FILE, filteredStudents);
    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, filteredGroups);

    res.send("Student deleted successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting student: " + error.message);
  }
};
