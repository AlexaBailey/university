import { SUBJECTS_FILE } from "../constants/filenames.js";
import { readTxtFileAsJson } from "../utils/fileHandlers.js";
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
