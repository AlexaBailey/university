import { readDecryptedFile } from "../utils/fileHandlers.js";
import { saveAndEncryptData } from "../utils/crypt.js";
import {
  EXAMS_INFO_FILE,
  EXAM_RESULTS_FILE,
  GROUPS_FILE,
  STUDENTS_GROUPS_FILE,
  SUBJECTS_FILE,
  TEACHERS_FILE,
} from "../constants/filenames.js";
import { gradingScale } from "../utils/gradingScale.js";
import { HTTP_STATUS } from "../constants/http.js";
import Link from "../Link/Link.class.js";

export const getAllExams = async (req, res) => {
  try {
    const { groupId, teacherId, date } = req.query;
    const examsInfo = await readDecryptedFile(EXAMS_INFO_FILE);
    const examResults = await readDecryptedFile(EXAM_RESULTS_FILE);

    const filteredExams = await Promise.all(
      examsInfo.map(async (exam) => {
        const resolvedGroup = await new Link(exam.groupId).resolveRow();
        const resolvedTeacher = await new Link(exam.teacherId).resolveRow();

        const matchesGroup = groupId
          ? parseInt(resolvedGroup.id) === parseInt(groupId)
          : true;
        const matchesTeacher = teacherId
          ? parseInt(resolvedTeacher.id) === parseInt(teacherId)
          : true;
        const matchesDate = date ? exam.date === date : true;

        return matchesGroup && matchesTeacher && matchesDate ? exam : null;
      })
    );

    const validExams = filteredExams.filter((exam) => exam !== null);
    const enrichedExams = await Promise.all(
      validExams.map(async (exam) => {
        const resolvedGroup = await new Link(exam.groupId).resolveRow();
        const resolvedTeacher = await new Link(exam.teacherId).resolveRow();
        const resolvedSubject = await new Link(exam.subjectId).resolveRow();

        let examLink = await Link.generateLinkForId(EXAMS_INFO_FILE, exam.id);
        const isAssessed = examResults.some(
          (result) => result.examId == examLink
        );

        let { teacherId, groupId, subjectId, ...rest } = exam;
        return {
          ...rest,
          group: {
            id: resolvedGroup.id,
            name: resolvedGroup.groupName,
          },
          teacher: {
            id: resolvedTeacher.id,
            name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
          },
          subject: {
            id: resolvedSubject.id,
            name: resolvedSubject.subject_name,
          },
          assessed: isAssessed,
        };
      })
    );

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
    const exams = await readDecryptedFile(EXAMS_INFO_FILE);
    const exam = exams.find((e) => parseInt(e.id) === parseInt(id));

    if (!exam) return res.status(HTTP_STATUS.NOT_FOUND).send("Exam not found.");

    const resolvedGroup = await new Link(exam.groupId).resolveRow();
    const resolvedTeacher = await new Link(exam.teacherId).resolveRow();
    const resolvedSubject = await new Link(exam.subjectId).resolveRow();
    let { teacherId, groupId, subjectId, ...rest } = exam;

    const enrichedExam = {
      ...rest,
      group: {
        id: resolvedGroup.id,
        name: resolvedGroup.groupName,
      },
      teacher: {
        id: resolvedTeacher.id,
        name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
      },
      subject: {
        id: resolvedSubject.id,
        name: resolvedSubject.subject_name,
      },
    };

    res.status(HTTP_STATUS.OK).send(enrichedExam);
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

    const exams = await readDecryptedFile(EXAMS_INFO_FILE);
    const newExam = {
      rowNumber: exams.length ? parseInt(exams[exams.length - 1].id) + 1 : 1,
      id: exams.length ? parseInt(exams[exams.length - 1].id) + 1 : 1,
      groupId: await Link.generateLinkForId(GROUPS_FILE, groupId),
      teacherId: await Link.generateLinkForId(TEACHERS_FILE, teacherId),
      subjectId: await Link.generateLinkForId(SUBJECTS_FILE, subjectId),
      date,
      time,
    };

    exams.push(newExam);
    await saveAndEncryptData(EXAMS_INFO_FILE, exams);

    const resolvedGroup = await Link.findById(GROUPS_FILE, groupId);
    const resolvedTeacher = await Link.findById(TEACHERS_FILE, teacherId);

    const resolvedSubject = await Link.findById(SUBJECTS_FILE, subjectId);

    const enrichedExam = {
      ...newExam,
      group: {
        id: resolvedGroup.id,
        name: resolvedGroup.groupName,
      },
      teacher: {
        id: resolvedTeacher.id,
        name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
      },
      subject: {
        id: resolvedSubject.id,
        name: resolvedSubject.subject_name,
      },
    };

    res
      .status(HTTP_STATUS.CREATED)
      .send({ message: "Exam added successfully", exam: enrichedExam });
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
    const exams = await readDecryptedFile(EXAMS_INFO_FILE);
    const index = exams.findIndex((e) => parseInt(e.id) === parseInt(id));

    if (index === -1)
      return res.status(HTTP_STATUS.NOT_FOUND).send("Exam not found.");

    exams[index] = {
      ...exams[index],
      groupId: await Link.generateLinkForId(
        GROUPS_FILE,
        parseInt(groupId) || parseInt(exams[index].groupId)
      ),
      teacherId: await Link.generateLinkForId(
        TEACHERS_FILE,
        parseInt(teacherId) || parseInt(exams[index].teacherId)
      ),
      subjectId: await Link.generateLinkForId(
        SUBJECTS_FILE,
        parseInt(subjectId) || parseInt(exams[index].subjectId)
      ),
      date: date || exams[index].date,
      time: time || exams[index].time,
    };

    await saveAndEncryptData(EXAMS_INFO_FILE, exams);

    const resolvedGroup = await new Link(exams[index].groupId).resolveRow();
    const resolvedTeacher = await new Link(exams[index].teacherId).resolveRow();
    const resolvedSubject = await new Link(exams[index].subjectId).resolveRow();

    const enrichedExam = {
      ...exams[index],
      group: {
        id: resolvedGroup.id,
        name: resolvedGroup.groupName,
      },
      teacher: {
        id: resolvedTeacher.id,
        name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
      },
      subject: {
        id: resolvedSubject.id,
        name: resolvedSubject.subject_name,
      },
    };

    res
      .status(HTTP_STATUS.OK)
      .send({ message: "Exam updated successfully", exam: enrichedExam });
  } catch (error) {
    console.error("Error updating exam:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating exam: " + error.message);
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exams = await readDecryptedFile(EXAMS_INFO_FILE);
    const filteredExams = exams.filter((e) => parseInt(e.id) !== parseInt(id));

    if (exams.length === filteredExams.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Exam not found.");
    }

    await saveAndEncryptData(EXAMS_INFO_FILE, filteredExams);
    res.status(HTTP_STATUS.OK).send("Exam deleted successfully.");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting exam: " + error.message);
  }
};
export const getAllExamResults = async (req, res) => {
  try {
    const { examId, groupId, studentId, teacherId } = req.query;

    const examResults = await readDecryptedFile(EXAM_RESULTS_FILE);
    const examsInfo = await readDecryptedFile(EXAMS_INFO_FILE);

    const enrichedResults = await Promise.all(
      examResults.map(async (result) => {
        try {
          const resolvedExam = await new Link(result.examId).resolveRow();
          if (!resolvedExam) return null;

          if (examId && parseInt(resolvedExam.id) !== parseInt(examId))
            return null;

          const resolvedGroup = await new Link(
            resolvedExam.groupId
          ).resolveRow();
          if (groupId && parseInt(resolvedGroup.id) !== parseInt(groupId))
            return null;

          const resolvedSubject = await new Link(
            resolvedExam.subjectId
          ).resolveRow();
          const resolvedStudent = await new Link(result.studentId).resolveRow();

          if (studentId && parseInt(resolvedStudent.id) !== parseInt(studentId))
            return null;

          const resolvedTeacher = await new Link(
            resolvedExam.teacherId
          ).resolveRow();
          if (teacherId && parseInt(resolvedTeacher.id) !== parseInt(teacherId))
            return null;

          return {
            ...result,
            student: {
              id: resolvedStudent.id,
              name: `${resolvedStudent.firstName} ${resolvedStudent.lastName}`,
            },
            group: {
              id: resolvedGroup.id,
              name: resolvedGroup.groupName,
            },
            subject: {
              id: resolvedSubject.id,
              name: resolvedSubject.subject_name,
            },
            teacher: {
              id: resolvedTeacher.id,
              name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
            },
            date: resolvedExam.date,
            time: resolvedExam.time,
          };
        } catch (err) {
          console.error("Error resolving result:", err.message);
          return null;
        }
      })
    );

    const validResults = enrichedResults.filter((result) => result !== null);

    if (validResults.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No exam results found for the specified criteria.");
    }

    res.status(HTTP_STATUS.OK).send(validResults);
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

    const examResults = await readDecryptedFile(EXAM_RESULTS_FILE);

    let examLink = await Link.generateLinkForId(EXAMS_INFO_FILE, examId);
    const existingResult = examResults.find(
      (result) => result.examId === examLink
    );
    if (existingResult) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .send("Exam has already been assessed.");
    }

    const examsInfo = await readDecryptedFile(EXAMS_INFO_FILE);
    const studentGroups = await readDecryptedFile(STUDENTS_GROUPS_FILE);

    const exam = examsInfo.find((e) => parseInt(e.id) === parseInt(examId));

    if (!exam) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Exam not found for the provided examId.");
    }

    const resolvedGroup = await new Link(exam.groupId).resolveRow();
    if (!resolvedGroup) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Group linked to the exam not found.");
    }

    const studentsInGroup = await Promise.all(
      studentGroups.map(async (entry) => {
        const resolvedStudentGroup = await new Link(entry.groupId).resolveRow();
        return parseInt(resolvedStudentGroup.id) === parseInt(resolvedGroup.id)
          ? entry
          : null;
      })
    );

    const validStudentsInGroup = studentsInGroup.filter(
      (entry) => entry !== null
    );

    if (!validStudentsInGroup.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No students found for the group.");
    }

    const lastRecordId = examResults.length
      ? parseInt(examResults[examResults.length - 1].recordId)
      : 0;

    const newResults = await Promise.all(
      validStudentsInGroup.map(async (entry, index) => {
        const studentLink = entry.studentId;
        const examLink = await Link.generateLinkForId(EXAMS_INFO_FILE, examId);

        return {
          recordId: lastRecordId + index + 1,
          examId: examLink,
          studentId: studentLink,
          mark: gradingScale(),
        };
      })
    );

    const updatedResults = [...examResults, ...newResults];
    await saveAndEncryptData(EXAM_RESULTS_FILE, updatedResults);

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
