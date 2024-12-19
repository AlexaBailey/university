import {
  TEACHERS_FILE,
  TEACHERS_SCHEDULE_FILE,
  TEACHERS_SUBJECTS_FILE,
  SUBJECTS_FILE,
} from "../constants/filenames.js";
import { readDecryptedFile } from "../utils/fileHandlers.js";
import { saveAndEncryptData } from "../utils/crypt.js";
import { HTTP_STATUS } from "../constants/http.js";
import Link from "../Link/Link.class.js";

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await readDecryptedFile(TEACHERS_FILE);
    res.status(HTTP_STATUS.OK).send(teachers);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error reading teachers data: " + error.message);
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Link.findById(TEACHERS_FILE, req.params.id);
    if (!teacher) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Teacher not found");
    }
    res.status(HTTP_STATUS.OK).send(teacher);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving teacher: " + error.message);
  }
};
export const getTeacherSubjects = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacherSubjects = await readDecryptedFile(TEACHERS_SUBJECTS_FILE);
    const result = await Promise.all(
      teacherSubjects.map(async (ts) => {
        const resolvedTeacher = await new Link(ts.teacherId).resolveRow();
        if (resolvedTeacher.id !== teacherId) return null;

        const resolvedSubject = await new Link(ts.subject_id).resolveRow();
        return {
          ...ts,
          teacher_name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
          subject_id: resolvedSubject?.id,
          subject_name: resolvedSubject?.subject_name || "Unknown",
        };
      })
    );
    const filteredResult = result.filter(Boolean);

    if (filteredResult.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No subjects found for the specified teacher.");
    }

    res.status(HTTP_STATUS.OK).send(filteredResult);
  } catch (error) {
    console.error("Error retrieving teacher subjects:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving teacher subjects: " + error.message);
  }
};

export const addTeacherSubject = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const subjectId = req.body.subject_id;

    const teacherSubjects = await readDecryptedFile(TEACHERS_SUBJECTS_FILE);
    const newSubject = {
      recordId: teacherSubjects.length
        ? parseInt(teacherSubjects[teacherSubjects.length - 1].recordId) + 1
        : 1,
      teacherId: await Link.generateLinkForId(TEACHERS_FILE, teacherId),
      subject_id: await Link.generateLinkForId(SUBJECTS_FILE, subjectId),
    };

    teacherSubjects.push(newSubject);
    await saveAndEncryptData(TEACHERS_SUBJECTS_FILE, teacherSubjects);
    res.status(HTTP_STATUS.CREATED).send("Subject added successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding subject: " + error.message);
  }
};

export const updateTeacherSubject = async (req, res) => {
  try {
    const recordId = req.params.subjectRecordId;
    const teacherSubjects = await readDecryptedFile(TEACHERS_SUBJECTS_FILE);

    const index = teacherSubjects.findIndex((s) => s.recordId === recordId);
    if (index === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Subject not found");
    }

    teacherSubjects[index] = {
      ...teacherSubjects[index],
      ...req.body,
    };

    await saveAndEncryptData(TEACHERS_SUBJECTS_FILE, teacherSubjects);
    res.status(HTTP_STATUS.OK).send("Subject updated successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating subject: " + error.message);
  }
};

export const deleteTeacherSubject = async (req, res) => {
  try {
    const recordId = req.params.subjectRecordId;
    const teacherSubjects = await readDecryptedFile(TEACHERS_SUBJECTS_FILE);

    const filteredSubjects = teacherSubjects.filter(
      (s) => s.recordId !== recordId
    );
    if (filteredSubjects.length === teacherSubjects.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Subject not found");
    }

    await saveAndEncryptData(TEACHERS_SUBJECTS_FILE, filteredSubjects);
    res.status(HTTP_STATUS.OK).send("Subject deleted successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting subject: " + error.message);
  }
};
export const getTeacherSchedule = async (req, res) => {
  try {
    const schedule = await readDecryptedFile(TEACHERS_SCHEDULE_FILE);
    const teacherSchedule = await Promise.all(
      schedule.map(async (entry) => {
        const resolvedTeacher = await new Link(entry.teacherId).resolveRow();
        if (resolvedTeacher.id === req.params.id) {
          const resolvedSubject = await new Link(entry.subjectId).resolveRow();
          return {
            ...entry,
            teacher_name: `${resolvedTeacher.firstName} ${resolvedTeacher.lastName}`,
            subject_name: resolvedSubject?.subject_name || "Unknown",
          };
        }
        return null;
      })
    );

    const filteredSchedule = teacherSchedule.filter(Boolean);

    if (filteredSchedule.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send("No schedule found for the specified teacher.");
    }

    res.status(HTTP_STATUS.OK).send(filteredSchedule);
  } catch (error) {
    console.error("Error retrieving schedule:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error retrieving schedule: " + error.message);
  }
};

export const addTeacherSchedule = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const schedule = await readDecryptedFile(TEACHERS_SCHEDULE_FILE);

    const newSchedule = {
      recordId: schedule.length
        ? parseInt(schedule[schedule.length - 1].recordId) + 1
        : 1,
      teacherId: await Link.generateLinkForId(TEACHERS_FILE, teacherId),
      day: req.body.day,
      time: req.body.time,
      subjectId: await Link.generateLinkForId(
        SUBJECTS_FILE,
        req.body.subjectId
      ),
    };

    schedule.push(newSchedule);
    await saveAndEncryptData(TEACHERS_SCHEDULE_FILE, schedule);
    res.status(HTTP_STATUS.CREATED).send("Schedule added successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding schedule: " + error.message);
  }
};

export const updateTeacherSchedule = async (req, res) => {
  try {
    const recordId = req.params.scheduleRecordId;
    const schedule = await readDecryptedFile(TEACHERS_SCHEDULE_FILE);

    const index = schedule.findIndex((s) => s.recordId === recordId);
    if (index === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Schedule not found");
    }

    schedule[index] = {
      ...schedule[index],
      ...req.body,
    };

    await saveAndEncryptData(TEACHERS_SCHEDULE_FILE, schedule);
    res.status(HTTP_STATUS.OK).send("Schedule updated successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating schedule: " + error.message);
  }
};

export const deleteTeacherSchedule = async (req, res) => {
  try {
    const recordId = req.params.scheduleRecordId;
    const schedule = await readDecryptedFile(TEACHERS_SCHEDULE_FILE);

    const filteredSchedule = schedule.filter((s) => s.recordId !== recordId);
    if (filteredSchedule.length === schedule.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Schedule not found");
    }

    await saveAndEncryptData(TEACHERS_SCHEDULE_FILE, filteredSchedule);
    res.status(HTTP_STATUS.OK).send("Schedule deleted successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting schedule: " + error.message);
  }
};

export const addTeacher = async (req, res) => {
  try {
    const teachers = await readDecryptedFile(TEACHERS_FILE);

    const newTeacher = {
      rowNumber: teachers.length ? parseInt(teachers.length) + 1 : 1,
      id:
        teachers.length > 0
          ? Math.max(...teachers.map((teacher) => parseInt(teacher.id))) + 1
          : 1,
      ...req.body,
    };

    teachers.push(newTeacher);
    await saveAndEncryptData(TEACHERS_FILE, teachers);

    res.status(HTTP_STATUS.CREATED).send("Teacher added successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error adding teacher: " + error.message);
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teachers = await readDecryptedFile(TEACHERS_FILE);

    const index = teachers.findIndex((t) => t.id === teacherId);
    if (index === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Teacher not found");
    }

    teachers[index] = {
      ...teachers[index],
      ...req.body,
    };

    console.log(teachers);

    await saveAndEncryptData(TEACHERS_FILE, teachers);
    res.status(HTTP_STATUS.OK).send("Teacher updated successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error updating teacher: " + error.message);
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teachers = await readDecryptedFile(TEACHERS_FILE);

    const filteredTeachers = teachers.filter((t) => t.id !== teacherId);
    if (filteredTeachers.length === teachers.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Teacher not found");
    }

    await saveAndEncryptData(TEACHERS_FILE, filteredTeachers);
    res.status(HTTP_STATUS.OK).send("Teacher deleted successfully");
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Error deleting teacher: " + error.message);
  }
};
