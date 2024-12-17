import {
  ASSESSMENTS_FILE,
  GROUPS_FILE,
  GROUPS_LESSONS_FILE,
  STUDENTS_FILE,
  STUDENTS_GROUPS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";

export const gradingScale = () => {
  return Math.floor(Math.random() * 10) + 1;
};

export const assessGroup = async (req, res) => {
  try {
    const { recordId } = req.body;

    console.log(`RecordId received: ${recordId}`);

    if (!recordId) {
      return res.status(400).send("recordId is required.");
    }

    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);

    const groupLesson = groupLessons.find(
      (lesson) => parseInt(lesson.groupLessonId) === parseInt(recordId)
    );

    if (!groupLesson) {
      return res.status(404).send("No lesson found for the given recordId.");
    }

    const { groupId, groupLessonId } = groupLesson;
    console.log(`GroupId for lesson: ${groupId}`);

    const groupStudents = studentGroups.filter(
      (entry) => parseInt(entry.groupId) === parseInt(groupId)
    );

    if (!groupStudents.length) {
      return res.status(404).send("No students found in this group.");
    }

    const newAssessments = groupStudents.map((entry) => ({
      groupLessonId,
      studentId: entry.studentId,
      mark: gradingScale(),
    }));

    const updatedAssessments = [...assessments, ...newAssessments];

    await saveJsonToTxtFile(ASSESSMENTS_FILE, updatedAssessments);

    res.status(200).send({
      message: "Group successfully assessed.",
      assessments: newAssessments,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error assessing group: " + error.message);
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
        .status(404)
        .send("No lessons found matching the specified filters.");
    }

    res.status(200).send(enrichedLessons);
  } catch (error) {
    res.status(500).send("Error retrieving group lessons: " + error.message);
  }
};

export const addGroupLesson = async (req, res) => {
  try {
    const { groupId, teacherId, subjectId, date, time } = req.body;

    if (!groupId || !teacherId || !subjectId || !date || !time) {
      return res.status(400).send("All fields are required.");
    }

    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);

    const newLesson = {
      groupLessonId: groupLessons.length
        ? groupLessons[groupLessons.length - 1].groupLessonId + 1
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
      .status(201)
      .send({ message: "Group lesson added successfully.", newLesson });
  } catch (error) {
    res.status(500).send("Error adding group lesson: " + error.message);
  }
};

export const addGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName) {
      return res.status(400).send("Group name is required.");
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

    res.status(201).send({ message: "Group added successfully.", newGroup });
  } catch (error) {
    res.status(500).send("Error adding group: " + error.message);
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await readTxtFileAsJson(GROUPS_FILE);
    res.status(200).send(groups);
  } catch (error) {
    res.status(500).send("Error retrieving groups: " + error.message);
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await readTxtFileAsJson(GROUPS_FILE);

    const group = groups.find((g) => g.groupId === id);

    if (!group) {
      return res.status(404).send("Group not found.");
    }

    res.status(200).send(group);
  } catch (error) {
    res.status(500).send("Error retrieving group: " + error.message);
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName } = req.body;

    const groups = await readTxtFileAsJson(GROUPS_FILE);
    const index = groups.findIndex((g) => g.groupId === id);

    if (index === -1) {
      return res.status(404).send("Group not found.");
    }

    groups[index] = {
      ...groups[index],
      groupName: groupName || groups[index].groupName,
    };

    await saveJsonToTxtFile(GROUPS_FILE, groups);

    res
      .status(200)
      .send({ message: "Group updated successfully.", group: groups[index] });
  } catch (error) {
    res.status(500).send("Error updating group: " + error.message);
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const groups = await readTxtFileAsJson(GROUPS_FILE);
    const filteredGroups = groups.filter((g) => g.groupId !== id);

    if (groups.length === filteredGroups.length) {
      return res.status(404).send("Group not found.");
    }

    await saveJsonToTxtFile(GROUPS_FILE, filteredGroups);

    res.status(200).send("Group deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting group: " + error.message);
  }
};

export const getStudentsByGroup = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send("Group ID is required and must be a number.");
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
      return res.status(404).send("No students found for this group.");
    }

    res.status(200).send(studentsInGroup);
  } catch (error) {
    res
      .status(500)
      .send("Error retrieving students by group: " + error.message);
  }
};
