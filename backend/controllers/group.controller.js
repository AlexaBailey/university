import {
  ASSESSMENTS_FILE,
  GROUPS_FILE,
  GROUPS_LESSONS_FILE,
  STUDENTS_FILE,
  STUDENTS_GROUPS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";

// Belarusian Grading Scale (1-10)
const gradingScale = () => {
  return Math.floor(Math.random() * 10) + 1; // Random grade between 1 and 10
};
// Assess a group for a specific lesson using recordId

export const assessGroup = async (req, res) => {
  try {
    const { recordId } = req.body;

    console.log(`RecordId received: ${recordId}`);

    // Validate request
    if (!recordId) {
      return res.status(400).send("recordId is required.");
    }

    // Load data
    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);
    const assessments = await readTxtFileAsJson(ASSESSMENTS_FILE);

    // Find the specific group lesson using recordId
    const groupLesson = groupLessons.find(
      (lesson) => parseInt(lesson.groupLessonId) === parseInt(recordId)
    );

    if (!groupLesson) {
      return res.status(404).send("No lesson found for the given recordId.");
    }

    const { groupId, groupLessonId } = groupLesson;
    console.log(`GroupId for lesson: ${groupId}`);

    // Find all students in the specified group from student_groups.txt
    const groupStudents = studentGroups.filter(
      (entry) => parseInt(entry.groupId) === parseInt(groupId)
    );

    if (!groupStudents.length) {
      return res.status(404).send("No students found in this group.");
    }

    // Generate assessments for each student in the group
    const newAssessments = groupStudents.map((entry) => ({
      groupLessonId,
      studentId: entry.studentId,
      mark: gradingScale(), // Assign a numeric grade between 1-10
    }));

    // Merge existing and new assessments
    const updatedAssessments = [...assessments, ...newAssessments];

    // Save assessments back to file
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

// Get group lessons filtered by groupId, teacherId, or date
export const getGroupLessons = async (req, res) => {
  try {
    const { groupId, teacherId, date } = req.query;
    console.log(req.query);

    const groupLessons = await readTxtFileAsJson(GROUPS_LESSONS_FILE);

    // Filter lessons based on optional parameters
    const filteredLessons = groupLessons.filter((lesson) => {
      const matchesGroup = groupId ? lesson.groupId === groupId : true;
      const matchesTeacher = teacherId ? lesson.teacherId === teacherId : true;
      const matchesDate = date ? lesson.date === date : true;

      return matchesGroup && matchesTeacher && matchesDate;
    });

    if (filteredLessons.length === 0) {
      return res
        .status(404)
        .send("No lessons found matching the specified filters.");
    }

    res.status(200).send(filteredLessons);
  } catch (error) {
    res.status(500).send("Error retrieving group lessons: " + error.message);
  }
};

// Add a new group lesson
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

// Create a new group
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

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await readTxtFileAsJson(GROUPS_FILE);
    res.status(200).send(groups);
  } catch (error) {
    res.status(500).send("Error retrieving groups: " + error.message);
  }
};

// Get group by ID
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

// Update group by ID
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

// Delete group by ID
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

// Get all students by group ID
export const getStudentsByGroup = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send("Group ID is required and must be a number.");
    }

    // Read students and student-groups files
    const students = await readTxtFileAsJson(STUDENTS_FILE);
    const studentGroups = await readTxtFileAsJson(STUDENTS_GROUPS_FILE);

    // Find all studentIds belonging to the specified groupId
    const studentIdsInGroup = studentGroups
      .filter((entry) => entry.groupId === id)
      .map((entry) => entry.studentId);

    // Find all matching student details
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
