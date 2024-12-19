import {
  SUBJECTS_FILE,
  TEACHERS_SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";
import { HTTP_STATUS } from "../constants/http.js";
import Link from "../Link/Link.class.js";

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);

    if (!subjects || subjects.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("No subjects found.");
    }

    res.status(HTTP_STATUS.OK).send(subjects);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving subjects: " + error.message);
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name } = req.body;

    if (!subject_name) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("Subject name is required.");
    }

    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);
    const resolvedSubject = await Link.findById(SUBJECTS_FILE, id);
    if (!resolvedSubject) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Subject not found with the given ID.");
    }

    const index = subjects.findIndex(
      (sub) => parseInt(sub.id) === parseInt(resolvedSubject.id)
    );
    subjects[index] = { ...subjects[index], subject_name };

    if (index === -1) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Subject not found with the given ID.");
    }

    subjects[index] = { ...subjects[index], subject_name };

    await saveJsonToTxtFile(SUBJECTS_FILE, subjects);
    res.status(HTTP_STATUS.OK).send({
      message: "Subject updated successfully.",
      updated: subjects[index],
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating subject: " + error.message);
  }
};
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);
    const teacherSubjects = await readTxtFileAsJson(TEACHERS_SUBJECTS_FILE);
    const resolvedSubject = await Link.findById(SUBJECTS_FILE, id);
    if (!resolvedSubject) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Subject not found with the given ID.");
    }
    const filteredSubjects = subjects.filter(
      (sub) => parseInt(sub.id) !== parseInt(id)
    );
    const filteredTeacherSubjects = await Promise.all(
      teacherSubjects.map(async (teacherSubject) => {
        const resolvedTeacherSubject = await new Link(
          teacherSubject.subject_id
        ).resolveRow();
        return parseInt(resolvedTeacherSubject.subject_id) !== parseInt(id)
          ? teacherSubject
          : null;
      })
    );

    await saveJsonToTxtFile(SUBJECTS_FILE, filteredSubjects);
    await saveJsonToTxtFile(
      TEACHERS_SUBJECTS_FILE,
      filteredTeacherSubjects.filter(Boolean)
    );

    res.status(HTTP_STATUS.OK).send({
      message: "Subject and associated teacher mappings deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting subject:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting subject: " + error.message);
  }
};
export const addSubject = async (req, res) => {
  try {
    const { subject_name } = req.body;

    if (!subject_name) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send("Subject name is required.");
    }

    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);

    const newSubject = {
      rowNumber: subjects.length ? parseInt(subjects.length) + 1 : 1,
      id:
        subjects.length > 0
          ? Math.max(...subjects.map((subject) => parseInt(subject.id))) + 1
          : 1,
      subject_name,
    };

    subjects.push(newSubject);

    await saveJsonToTxtFile(SUBJECTS_FILE, subjects);

    res.status(HTTP_STATUS.CREATED).send({
      message: "Subject added successfully.",
      newSubject,
    });
  } catch (error) {
    console.error("Error adding subject:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding subject: " + error.message);
  }
};
