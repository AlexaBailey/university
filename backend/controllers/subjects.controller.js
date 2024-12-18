import {
  SUBJECTS_FILE,
  TEACHERS_SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readTxtFileAsJson, saveJsonToTxtFile } from "../utils/fileHandlers.js";
import { HTTP_STATUS } from "../constants/http.js";

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
    const index = subjects.findIndex((sub) => sub.subject_id === id);

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
    const filteredSubjects = subjects.filter((sub) => sub.subject_id !== id);

    if (filteredSubjects.length === subjects.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("Subject not found with the given ID.");
    }

    const filteredTeacherSubjects = teacherSubjects.filter(
      (teacherSubject) => teacherSubject.subject_id !== id
    );
    await saveJsonToTxtFile(SUBJECTS_FILE, filteredSubjects);
    await saveJsonToTxtFile(TEACHERS_SUBJECTS_FILE, filteredTeacherSubjects);

    res.status(HTTP_STATUS.OK).send({
      message: "Subject and associated teacher mappings deleted successfully.",
    });
  } catch (error) {
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
      subject_id: subjects.length
        ? parseInt(subjects[subjects.length - 1].subject_id) + 1
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
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding subject: " + error.message);
  }
};
