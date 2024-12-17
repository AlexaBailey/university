import { SUBJECTS_FILE } from "../constants/filenames.js";
import { readTxtFileAsJson } from "../utils/fileHandlers.js";

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await readTxtFileAsJson(SUBJECTS_FILE);

    if (!subjects || subjects.length === 0) {
      return res.status(404).send("No subjects found.");
    }

    res.status(200).send(subjects);
  } catch (error) {
    res.status(500).send("Error retrieving subjects: " + error.message);
  }
};
