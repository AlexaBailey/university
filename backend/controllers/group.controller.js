import {
  ASSESSMENTS_FILE,
  GROUPS_FILE,
  GROUPS_LESSONS_FILE,
  STUDENTS_FILE,
  STUDENTS_GROUPS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";
import { gradingScale } from "../utils/gradingScale.js";
import { HTTP_STATUS } from "../constants/http.js";

export const assessGroup = async (req, res) => {
  try {
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send("recordId is required.");
    }

    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);

    const groupLesson = groupLessons.find(
      (lesson) => parseInt(lesson.groupLessonId) === parseInt(recordId)
    );

    if (!groupLesson) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No lesson found for the given recordId.");
    }

    const { groupId, groupLessonId } = groupLesson;

    const groupStudents = studentGroups.filter(
      (entry) => parseInt(entry.groupId) === parseInt(groupId)
    );

    if (!groupStudents.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No students found in this group.");
    }

    const newAssessments = groupStudents.map((entry) => ({
      groupLessonId,
      studentId: entry.studentId,
      mark: gradingScale(),
    }));

    const updatedAssessments = [...assessments, ...newAssessments];

    await saveJsonToTxtFile(ASSESSMENTS_FILE, updatedAssessments);

    res.status(HTTP_STATUS.OK).send({
      message: "Group successfully assessed.",
      assessments: newAssessments,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error assessing group: " + error.message);
  }
};

export const getAssessmentDetails = async (req, res) => {
  try {
    const { groupLessonId } = req.params;
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);
    const students = await readTxtFileAsJson(STUDENTS_FILE);

    const relevantAssessments = assessments.filter(
      (a) => parseInt(a.groupLessonId) === parseInt(groupLessonId)
    );

    if (relevantAssessments.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No assessments found for this lesson.");
    }

    const detailedAssessments = relevantAssessments.map((a) => {
      const student = students.find(
        (s) => parseInt(s.id) === parseInt(a.studentId)
      );
      return {
        groupLessonId: a.groupLessonId,
        studentId: a.studentId,
        studentName: student
          ? `${student.firstName} ${student.lastName}`
          : "Unknown",
        mark: a.mark,
      };
    });

    res.status(HTTP_STATUS.OK).send(detailedAssessments);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving assessment details: " + error.message);
  }
};

export const getGroupLessons = async (req, res) => {
  try {
    const { groupId, teacherId, date } = req.query;

    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);

    const filteredLessons = groupLessons.filter((lesson) => {
      const matchesGroup = groupId ? lesson.groupId === groupId : true;
      const matchesTeacher = teacherId ? lesson.teacherId === teacherId : true;
      const matchesDate = date ? lesson.date === date : true;

      return matchesGroup && matchesTeacher && matchesDate;
    });

    const enrichedLessons = filteredLessons.map((lesson) => {
      const alreadyAssessed = assessments.some(
        (assessment) =>
          parseInt(assessment.groupLessonId) === parseInt(lesson.groupLessonId)
      );

      return {
        ...lesson,
        assessed: alreadyAssessed,
      };
    });

    if (enrichedLessons.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No lessons found matching the specified filters.");
    }

    res.status(HTTP_STATUS.OK).send(enrichedLessons);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving group lessons: " + error.message);
  }
};

export const addGroupLesson = async (req, res) => {
  try {
    const { groupId, teacherId, subjectId, date, time } = req.body;

    if (!groupId || !teacherId || !subjectId || !date || !time) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("All fields are required.");
    }

    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);

    const newLesson = {
      groupLessonId: groupLessons.length
        ? parseInt(groupLessons[groupLessons.length - 1].groupLessonId) + 1
        : 1,
      groupId,
      teacherId,
      subjectId,
      date,
      time,
    };

    groupLessons.push(newLesson);
    await saveJsonToTxtFile(GROUPS_LESSONS_FILE, groupLessons);

    res
      .status(HTTP_STATUS.CREATED)
      .send({ message: "Group lesson added successfully.", newLesson });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding group lesson: " + error.message);
  }
};

export const addGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("Group name is required.");
    }

    const groups = await readTxtFileAsJson(GROUPS_FILE);

    const newGroup = {
      groupId: groups.length
        ? parseInt(groups[groups.length - 1].groupId) + 1
        : 1,
      groupName,
    };

    groups.push(newGroup);
    await saveJsonToTxtFile(GROUPS_FILE, groups);

    res
      .status(HTTP_STATUS.CREATED)
      .send({ message: "Group added successfully.", newGroup });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding group: " + error.message);
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await readTxtFileAsJson(GROUPS_FILE);
    res.status(HTTP_STATUS.OK).send(groups);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving groups: " + error.message);
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await readTxtFileAsJson(GROUPS_FILE);

    const group = groups.find((g) => g.groupId === id);

    if (!group) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Group not found.");
    }

    res.status(HTTP_STATUS.OK).send(group);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving group: " + error.message);
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName } = req.body;

    const groups = await readTxtFileAsJson(GROUPS_FILE);
    const index = groups.findIndex((g) => g.groupId === id);

    if (index === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Group not found.");
    }

    groups[index] = {
      ...groups[index],
      groupName: groupName || groups[index].groupName,
    };

    await saveJsonToTxtFile(GROUPS_FILE, groups);

    res
      .status(HTTP_STATUS.OK)
      .send({ message: "Group updated successfully.", group: groups[index] });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating group: " + error.message);
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await readTxtFileAsJson(GROUPS_FILE);
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const filteredGroups = groups.filter((g) => g.groupId !== id);
    if (groups.length === filteredGroups.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Group not found.");
    }
    const studentGroupEntries = studentGroups.filter((sg) => sg.groupId === id);
    const studentIdsToDelete = studentGroupEntries.map((sg) => sg.studentId);
    const filteredStudents = students.filter(
      (student) => !studentIdsToDelete.includes(student.id)
    );
    const filteredStudentGroups = studentGroups.filter(
      (sg) => sg.groupId !== id
    );
    await saveJsonToTxtFile(GROUPS_FILE, filteredGroups);
    await saveJsonToTxtFile(STUDENTS_FILE, filteredStudents);
    await saveJsonToTxtFile(STUDENTS_GROUPS_FILE, filteredStudentGroups);

    res
      .status(HTTP_STATUS.OK)
      .send(
        `Group and associated students deleted successfully. Deleted ${studentIdsToDelete.length} students.`
      );
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting group and students: " + error.message);
  }
};
export const getStudentsByGroup = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("Group ID is required and must be a number.");
    }

    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    const studentIdsInGroup = studentGroups
      .filter((entry) => entry.groupId === id)
      .map((entry) => entry.studentId);

    const studentsInGroup = students.filter((student) =>
      studentIdsInGroup.includes(student.id)
    );

    if (studentsInGroup.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No students found for this group.");
    }

    res.status(HTTP_STATUS.OK).send(studentsInGroup);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving students by group: " + error.message);
  }
};
