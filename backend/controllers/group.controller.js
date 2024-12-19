import {
  ASSESSMENTS_FILE,
  GROUPS_FILE,
  GROUPS_LESSONS_FILE,
  STUDENTS_FILE,
  STUDENTS_GROUPS_FILE,
  SUBJECTS_FILE,
  TEACHERS_FILE,
} from "../constants/filenames.js";
import { readDecryptedFile } from "../utils/fileHandlers.js";
import { saveAndEncryptData } from "../utils/crypt.js";
import { gradingScale } from "../utils/gradingScale.js";
import { HTTP_STATUS } from "../constants/http.js";
import Link from "../Link/Link.class.js";

export const assessGroup = async (req, res) => {
  try {
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send("recordId is required.");
    }

    const groupLessons = await readDecryptedFile(GROUPS_LESSONS_FILE);
    const studentGroups = await readDecryptedFile(STUDENTS_GROUPS_FILE);
    const assessments = await readDecryptedFile(ASSESSMENTS_FILE);
    const groupLesson = await Link.findById(GROUPS_LESSONS_FILE, recordId);

    if (!groupLesson) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No lesson found for the given recordId.");
    }

    const resolvedGroup = await new Link(groupLesson.groupId).resolveRow();
    if (!resolvedGroup) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Group linked to the lesson not found.");
    }

    const groupStudents = await Promise.all(
      studentGroups
        .filter((entry) => entry.groupId == groupLesson.groupId)
        .map(async (entry) => {
          const resolvedStudent = await new Link(entry.studentId).resolveRow();
          return resolvedStudent
            ? { ...entry, student: resolvedStudent }
            : null;
        })
    );

    const validGroupStudents = groupStudents.filter((entry) => entry !== null);

    if (!validGroupStudents.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No students found in this group.");
    }

    const newAssessments = await Promise.all(
      validGroupStudents.map(async (entry, index) => {
        const maxRecordId = assessments.length
          ? Math.max(...assessments.map((a) => parseInt(a.recordId))) + 1
          : 1;

        return {
          recordId: maxRecordId + index,
          groupLessonId: await Link.generateLinkForId(
            GROUPS_LESSONS_FILE,
            groupLesson.id
          ),
          studentId: await Link.generateLinkForId(
            STUDENTS_FILE,
            entry.student.id
          ),
          mark: gradingScale(),
        };
      })
    );

    const updatedAssessments = [...assessments, ...newAssessments];

    await saveAndEncryptData(ASSESSMENTS_FILE, updatedAssessments);

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

    if (!groupLessonId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("groupLessonId is required.");
    }

    const assessments = await readDecryptedFile(ASSESSMENTS_FILE);

    const relevantAssessments = assessments.filter(
      (a) => parseInt(a.groupLessonId) === parseInt(groupLessonId)
    );

    const assessed = relevantAssessments.length > 0;

    const detailedAssessments = await Promise.all(
      relevantAssessments.map(async (a) => {
        try {
          const resolvedStudent = await new Link(a.studentId).resolveRow();
          return {
            groupLessonId: a.groupLessonId,
            studentId: a.studentId,
            studentName: resolvedStudent
              ? `${resolvedStudent.firstName} ${resolvedStudent.lastName}`
              : "Unknown",
            mark: a.mark,
          };
        } catch (err) {
          return {
            groupLessonId: a.groupLessonId,
            studentId: a.studentId,
            studentName: "Unknown",
            mark: a.mark,
          };
        }
      })
    );

    res.status(HTTP_STATUS.OK).send({
      assessed,
      details: detailedAssessments,
    });
  } catch (error) {
    console.error("Error retrieving assessment details:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving assessment details: " + error.message);
  }
};
export const getGroupLessons = async (req, res) => {
  try {
    const { groupId, teacherId, date } = req.query;

    const groupLessons = await readDecryptedFile(GROUPS_LESSONS_FILE);
    const assessments = await readDecryptedFile(ASSESSMENTS_FILE);

    const filteredLessons = await Promise.all(
      groupLessons.map(async (lesson) => {
        try {
          const resolvedGroup = await new Link(lesson.groupId).resolveRow();
          const resolvedTeacher = await new Link(lesson.teacherId).resolveRow();
          const resolvedSubject = await new Link(lesson.subjectId).resolveRow();

          const matchesGroup = groupId
            ? parseInt(resolvedGroup.id) === parseInt(groupId)
            : true;
          const matchesTeacher = teacherId
            ? parseInt(resolvedTeacher.id) === parseInt(teacherId)
            : true;
          const matchesDate = date ? lesson.date === date : true;

          return matchesGroup && matchesTeacher && matchesDate
            ? {
                ...lesson,
                resolvedGroup,
                resolvedTeacher,
                resolvedSubject,
              }
            : null;
        } catch (err) {
          return null;
        }
      })
    );

    const validLessons = filteredLessons.filter((lesson) => lesson !== null);

    const enrichedLessons = await Promise.all(
      validLessons.map(async (lesson) => {
        const alreadyAssessed = await Promise.all(
          assessments.map(async (assessment) => {
            const resolvedAssessment = await new Link(
              assessment.groupLessonId
            ).resolveRow();
            return parseInt(resolvedAssessment.id) === parseInt(lesson.id);
          })
        );

        return {
          ...lesson,
          assessed: alreadyAssessed.includes(true),
          subject: {
            id: lesson.resolvedSubject.id,
            name: lesson.resolvedSubject.subject_name,
          },
        };
      })
    );

    if (enrichedLessons.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No lessons found matching the specified filters.");
    }

    res.status(HTTP_STATUS.OK).send(enrichedLessons);
  } catch (error) {
    console.error("Error retrieving group lessons:", error.message);
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
    const resolvedGroup = await Link.findById(GROUPS_FILE, groupId);
    const resolvedTeacher = await Link.findById(TEACHERS_FILE, teacherId);
    const resolvedSubject = await Link.findById(SUBJECTS_FILE, subjectId);

    if (!resolvedGroup || !resolvedTeacher || !resolvedSubject) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Invalid group, teacher, or subject ID provided.");
    }

    const groupLessons = await readDecryptedFile(GROUPS_LESSONS_FILE);

    const newLesson = {
      rowNumber: groupLessons.length ? +groupLessons.length + 1 : 1,
      id: groupLessons.length
        ? Math.max(...groupLessons.map((lesson) => parseInt(lesson.id))) + 1
        : 1,
      groupId: await Link.generateLinkForId(GROUPS_FILE, resolvedGroup.id),
      teacherId: await Link.generateLinkForId(
        TEACHERS_FILE,
        resolvedTeacher.id
      ),
      subjectId: await Link.generateLinkForId(
        SUBJECTS_FILE,
        resolvedSubject.id
      ),
      date,
      time,
    };

    groupLessons.push(newLesson);
    await saveAndEncryptData(GROUPS_LESSONS_FILE, groupLessons);

    res.status(HTTP_STATUS.CREATED).send({
      message: "Group lesson added successfully.",
      newLesson,
    });
  } catch (error) {
    console.error("Error adding group lesson:", error.message);
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

    const groups = await readDecryptedFile(GROUPS_FILE);

    const newGroup = {
      rowNumber: groups.length ? parseInt(groups[groups.length - 1].id) + 1 : 1,
      id:
        groups.length > 0
          ? Math.max(...groups.map((group) => parseInt(group.id))) + 1
          : 1,
      groupName,
    };

    groups.push(newGroup);
    await saveAndEncryptData(GROUPS_FILE, groups);

    const groupLink = await Link.generateLinkForId(GROUPS_FILE, newGroup.id);

    res.status(HTTP_STATUS.CREATED).send({
      message: "Group added successfully.",
      newGroup: {
        ...newGroup,
        groupId: groupLink,
      },
    });
  } catch (error) {
    console.error("Error adding group:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding group: " + error.message);
  }
};
export const getAllGroups = async (req, res) => {
  try {
    const groups = await readDecryptedFile(GROUPS_FILE);
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => ({
        ...group,
        groupId: group.id,
      }))
    );

    res.status(HTTP_STATUS.OK).send(enrichedGroups);
  } catch (error) {
    console.error("Error retrieving groups:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving groups: " + error.message);
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const resolvedGroup = await Link.findById(GROUPS_FILE, id);

    if (!resolvedGroup) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Group not found.");
    }

    const enrichedGroup = {
      ...resolvedGroup,
    };

    res.status(HTTP_STATUS.OK).send(enrichedGroup);
  } catch (error) {
    console.error("Error retrieving group by ID:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving group: " + error.message);
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName } = req.body;

    const groups = await readDecryptedFile(GROUPS_FILE);
    const resolvedGroup = await Link.findById(GROUPS_FILE, id);

    if (!resolvedGroup) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Group not found.");
    }
    resolvedGroup.groupName = groupName || resolvedGroup.groupName;

    await saveAndEncryptData(GROUPS_FILE, groups);

    res.status(HTTP_STATUS.OK).send({
      message: "Group updated successfully.",
      group: resolvedGroup,
    });
  } catch (error) {
    console.error("Error updating group:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating group: " + error.message);
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const groups = await readDecryptedFile(GROUPS_FILE);
    const studentGroups = await readDecryptedFile(STUDENTS_GROUPS_FILE);

    const resolvedGroup = await Link.findById(GROUPS_FILE, id);
    if (!resolvedGroup) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Group not found.");
    }

    const filteredGroups = groups.filter(
      (group) => group.id !== resolvedGroup.id
    );

    const filteredStudentGroups = await Promise.all(
      studentGroups.filter(async (studentGroup) => {
        const resolvedGroupLink = await new Link(
          studentGroup.groupId
        ).resolveRow();
        return resolvedGroupLink.id !== resolvedGroup.id;
      })
    );

    await saveAndEncryptData(STUDENTS_GROUPS_FILE, filteredStudentGroups);
    await saveAndEncryptData(GROUPS_FILE, filteredGroups);

    res.status(HTTP_STATUS.OK).send({
      message: `Group and associated student links deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting group:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting group: " + error.message);
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

    const studentGroups = await readDecryptedFile(STUDENTS_GROUPS_FILE);
    const filteredStudentGroups = (
      await Promise.all(
        studentGroups.map(async (entry) => {
          const resolvedGroup = await new Link(entry.groupId).resolveRow();
          if (parseInt(resolvedGroup.id) === parseInt(id)) {
            return entry;
          }
          return null;
        })
      )
    ).filter(Boolean);

    if (filteredStudentGroups.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No students found for this group.");
    }
    const studentsInGroup = await Promise.all(
      filteredStudentGroups.map(async (entry) => {
        const resolvedStudent = await new Link(entry.studentId).resolveRow();
        return resolvedStudent;
      })
    );

    const validStudents = studentsInGroup.filter((student) => student !== null);

    if (validStudents.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No valid students found for this group.");
    }

    res.status(HTTP_STATUS.OK).send(validStudents);
  } catch (error) {
    console.error("Error retrieving students by group:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving students by group: " + error.message);
  }
};
