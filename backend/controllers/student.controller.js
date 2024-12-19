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
import Link from "../Link/Link.class.js";
export const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.params.id;

    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);
    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);
    const examsInfo = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const examsResults = await readTxtFileAsJson(EXAM_RESULTS_FILE);

    const studentAssessments = (
      await Promise.all(
        assessments.map(async (assessment) => {
          try {
            const resolvedStudent = await new Link(
              assessment.studentId
            ).resolveRow();
            if (resolvedStudent.id !== studentId) return null;

            const resolvedLesson = await new Link(
              assessment.groupLessonId
            ).resolveRow();
            const resolvedSubject = resolvedLesson
              ? await new Link(resolvedLesson.subjectId).resolveRow()
              : null;

            return {
              type: "Assessment",
              mark: parseFloat(assessment.mark),
              subject_name: resolvedSubject
                ? resolvedSubject.subject_name
                : "Unknown",
              date: resolvedLesson ? resolvedLesson.date : "N/A",
            };
          } catch {
            return null;
          }
        })
      )
    ).filter((record) => record !== null);

    const studentExams = (
      await Promise.all(
        examsResults.map(async (examResult) => {
          try {
            const resolvedStudent = await new Link(
              examResult.studentId
            ).resolveRow();
            if (resolvedStudent.id !== studentId) return null;

            const resolvedExam = await new Link(examResult.examId).resolveRow();
            const resolvedSubject = resolvedExam
              ? await new Link(resolvedExam.subjectId).resolveRow()
              : null;

            return {
              type: "Exam",
              mark: parseFloat(examResult.mark),
              subject_name: resolvedSubject
                ? resolvedSubject.subject_name
                : "Unknown",
              date: resolvedExam ? resolvedExam.date : "N/A",
            };
          } catch {
            return null;
          }
        })
      )
    ).filter((record) => record !== null);
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
    console.error("Error retrieving student grades:", error.message);
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

    const studentsWithGroups = await Promise.all(
      students.map(async (student) => {
        try {
          const studentGroup = await Promise.all(
            studentGroups.map(async (entry) => {
              const resolvedStudentId = await new Link(
                entry.studentId
              ).resolveRow();
              if (parseInt(resolvedStudentId.id) === parseInt(student.id)) {
                return entry;
              }
              return null;
            })
          );

          const validStudentGroup = studentGroup.filter(
            (group) => group !== null
          )[0];

          if (validStudentGroup) {
            const resolvedGroup = await new Link(
              validStudentGroup.groupId
            ).resolveRow();
            return {
              ...student,
              group: {
                id: resolvedGroup.id,
                name: resolvedGroup.groupName,
              },
            };
          }

          return {
            ...student,
            group: null,
          };
        } catch (err) {
          console.error(
            `Error resolving group for student ID ${student.id}:`,
            err.message
          );
          return {
            ...student,
            group: null,
          };
        }
      })
    );

    res.status(HTTP_STATUS.OK).send(studentsWithGroups);
  } catch (error) {
    console.error("Error reading students data:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error reading students data: " + error.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    const resolvedStudent = await Link.findById(STUDENTS_FILE, studentId);

    if (!resolvedStudent) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Student not found");
    }

    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const studentGroup = studentGroups.find(
      (entry) => parseInt(entry.studentId) === parseInt(resolvedStudent.id)
    );

    const groupData = studentGroup
      ? await new Link(studentGroup.groupId).resolveRow()
      : null;

    res.send({
      ...resolvedStudent,
      group: groupData || null,
    });
  } catch (error) {
    console.error("Error retrieving student by ID:", error.message);
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
      : 1;
    const rowNumber = validStudents.length
      ? parseInt(validStudents.length) + 1
      : 1;

    const newId = maxId + 1;
    let { id, groupId, ...rest } = req.body;
    const newStudent = { rowNumber, id: newId, ...rest };
    students.push(newStudent);
    await saveJsonToTxtFile(STUDENTS_FILE, students);

    if (groupId) {
      const groupLink = await Link.generateLinkForId(GROUPS_FILE, groupId);
      studentGroups.push({
        recordId: studentGroups.length
          ? parseInt(studentGroups[studentGroups.length - 1].recordId) + 1
          : 1,
        studentId: await Link.generateLinkForId(STUDENTS_FILE, newId),
        groupId: groupLink,
      });
    }

    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, studentGroups);

    res.status(HTTP_STATUS.CREATED).send({
      message: "Student added successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error adding student:", error.message);
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
    const resolvedStudent = await Link.findById(STUDENTS_FILE, id);
    const index = students.findIndex((s) => s.id === resolvedStudent.id);
    if (index === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Student not found");
    }
    let { group, groupId, ...rest } = req.body;
    students[index] = { ...students[index], ...rest };
    await saveJsonToTxtFile(STUDENTS_FILE, students);
    if (groupId) {
      const groupLink = await Link.generateLinkForId(GROUPS_FILE, groupId);
      const groupIndex = (
        await Promise.all(
          studentGroups.map(async (g, idx) => {
            const resolvedStudentId = await new Link(g.studentId).resolveRow();
            return resolvedStudentId.id === resolvedStudent.id ? idx : -1;
          })
        )
      ).find((idx) => idx !== -1);

      if (groupIndex !== undefined && groupIndex !== -1) {
        studentGroups[groupIndex].groupId = groupLink;
      } else {
        studentGroups.push({
          recordId: studentGroups.length
            ? parseInt(studentGroups[studentGroups.length - 1].recordId) + 1
            : 1,
          studentId: await Link.generateLinkForId(
            STUDENTS_FILE,
            resolvedStudent.id
          ),
          groupId: groupLink,
        });
      }
    }

    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, studentGroups);

    res.send({
      message: "Student updated successfully",
      student: students[index],
    });
  } catch (error) {
    console.error("Error updating student:", error.message);
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

    const resolvedStudent = await Link.findById(STUDENTS_FILE, id);
    if (!resolvedStudent) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Student not found.");
    }

    const filteredStudents = students.filter(
      (s) => s.id !== resolvedStudent.id
    );

    const resolvedStudentGroups = await Promise.all(
      studentGroups.map(async (studentGroup) => {
        const resolvedStudentGroup = await new Link(
          studentGroup.studentId
        ).resolveRow();
        return { ...studentGroup, resolvedStudentGroup };
      })
    );

    const filteredStudentGroups = resolvedStudentGroups
      .filter((entry) => entry.resolvedStudentGroup.id !== resolvedStudent.id)
      .map((entry) => {
        const { resolvedStudentGroup, ...originalEntry } = entry;
        return originalEntry;
      });

    await saveJsonToTxtFile(STUDENTS_FILE, filteredStudents);
    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, filteredStudentGroups);

    res.send("Student deleted successfully");
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting student: " + error.message);
  }
};
