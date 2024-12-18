import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";
import {
  EXAMS_INFO_FILE,
  EXAM_RESULTS_FILE,
  GROUPS_FILE,
  STUDENTS_GROUPS_FILE,
  SUBJECTS_FILE,
} from "../constants/filenames.js";
import { gradingScale } from "../utils/gradingScale.js";
import { HTTP_STATUS } from "../constants/http.js";

export const getAllExams = async (req, res) => {
  try {
    const { groupId, teacherId, date } = req.query;

    const examsInfo = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const groups = await readTxtFileAsJson(GROUPS_FILE);
    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);

    const filteredExams = examsInfo.filter((exam) => {
      const matchesGroup = groupId
        ? parseInt(exam.groupId) === parseInt(groupId)
        : true;
      const matchesTeacher = teacherId
        ? parseInt(exam.teacherId) === parseInt(teacherId)
        : true;
      const matchesDate = date ? exam.date === date : true;

      return matchesGroup && matchesTeacher && matchesDate;
    });

    const enrichedExams = filteredExams.map((exam) => {
      const group = groups.find(
        (g) => parseInt(g.groupId) === parseInt(exam.groupId)
      );
      const subject = subjects.find(
        (s) => parseInt(s.subject_id) === parseInt(exam.subjectId)
      );

      return {
        ...exam,
        group: group || { id: exam.groupId, groupName: "Unknown Group" },
        subject: subject || {
          subject_id: exam.subjectId,
          subject_name: "Unknown Subject",
        },
      };
    });

    if (enrichedExams.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No exams found matching the specified filters.");
    }

    res.status(HTTP_STATUS.OK).send(enrichedExams);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving exams: " + error.message);
  }
};

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exams = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const exam = exams.find((e) => e.examId === id);

    if (!exam) return res.status(HTTP_STATUS.NOT_FOUND).send("Exam not found.");
    res.status(HTTP_STATUS.OK).send(exam);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving exam: " + error.message);
  }
};

export const addExam = async (req, res) => {
  try {
    const { groupId, teacherId, subjectId, date, time } = req.body;

    if (!groupId || !teacherId || !subjectId || !date || !time) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("All fields are required.");
    }

    const exams = await readTxtFileAsJson(EXAMS_INFO_FILE);

    const newExam = {
      examId: exams.length ? parseInt(exams[exams.length - 1].examId) + 1 : 1,
      groupId: parseInt(groupId),
      teacherId: parseInt(teacherId),
      subjectId: parseInt(subjectId),
      date,
      time,
    };

    exams.push(newExam);
    await saveJsonToTxtFile(EXAMS_INFO_FILE, exams);

    res
      .status(HTTP_STATUS.CREATED)
      .send({ message: "Exam added successfully", newExam });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding exam: " + error.message);
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupId, teacherId, subjectId, date, time } = req.body;

    const exams = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const index = exams.findIndex((e) => e.examId === id);

    if (index === -1)
      return res.status(HTTP_STATUS.NOT_FOUND).send("Exam not found.");

    exams[index] = {
      ...exams[index],
      groupId: groupId || exams[index].groupId,
      teacherId: teacherId || exams[index].teacherId,
      subjectId: subjectId || exams[index].subjectId,
      date: date || exams[index].date,
      time: time || exams[index].time,
    };

    await saveJsonToTxtFile(EXAMS_INFO_FILE, exams);
    res
      .status(HTTP_STATUS.OK)
      .send({ message: "Exam updated successfully", exam: exams[index] });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating exam: " + error.message);
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exams = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const filteredExams = exams.filter((e) => e.examId != id);

    if (exams.length === filteredExams.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Exam not found.");
    }

    await saveJsonToTxtFile(EXAMS_INFO_FILE, filteredExams);
    res.status(HTTP_STATUS.OK).send("Exam deleted successfully.");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting exam: " + error.message);
  }
};

export const getAllExamResults = async (req, res) => {
  try {
    const { groupId } = req.query;

    const examResults = await readTxtFileAsJson(EXAM_RESULTS_FILE);
    const examsInfo = await readTxtFileAsJson(EXAMS_INFO_FILE);

    let filteredResults = examResults;

    if (groupId) {
      const examIdsForGroup = examsInfo
        .filter((exam) => parseInt(exam.groupId) === parseInt(groupId))
        .map((exam) => exam.examId);

      filteredResults = examResults.filter((result) =>
        examIdsForGroup.includes(result.examId)
      );
    }

    if (filteredResults.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No exam results found for the specified groupId.");
    }

    res.status(HTTP_STATUS.OK).send(filteredResults);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving exam results: " + error.message);
  }
};
export const addExamResult = async (req, res) => {
  try {
    const { examId } = req.body;

    if (!examId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send("examId is required.");
    }

    const examsInfo = await readTxtFileAsJson(EXAMS_INFO_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const examResults = await readTxtFileAsJson(EXAM_RESULTS_FILE);

    const exam = examsInfo.find((e) => parseInt(e.examId) === parseInt(examId));

    if (!exam) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Exam not found for the provided examId.");
    }

    const { groupId } = exam;

    const studentsInGroup = studentGroups.filter(
      (entry) => parseInt(entry.groupId) === parseInt(groupId)
    );

    if (!studentsInGroup.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No students found for the group.");
    }

    const newResults = studentsInGroup.map((entry) => ({
      recordId: examResults.length
        ? parseInt(examResults[examResults.length - 1].recordId) + 1
        : 1,
      examId: parseInt(examId),
      studentId: entry.studentId,
      mark: gradingScale(),
    }));

    const updatedResults = [...examResults, ...newResults];
    await saveJsonToTxtFile(EXAM_RESULTS_FILE, updatedResults);

    res.status(HTTP_STATUS.CREATED).send({
      message: "Exam results added successfully.",
      results: newResults,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding exam results: " + error.message);
  }
};
