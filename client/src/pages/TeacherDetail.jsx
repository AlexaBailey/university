import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import Modal from "../components/Modal";
import { TiTick } from "react-icons/ti";
import { RxCross1 } from "react-icons/rx";
const TeacherDetail = () => {
  const { id: teacherId } = useParams();
  const [teacher, setTeacher] = useState({});
  const [teacherData, setTeacherData] = useState({
    firstName: "",
    lastName: "",
    age: 0,
  });

  const [groupLessons, setGroupLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");

  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editSubjectRecordId, setEditSubjectRecordId] = useState(null);
  const [editScheduleRecordId, setEditScheduleRecordId] = useState(null);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [subjectData, setSubjectData] = useState({
    subject_id: "",
    subject_name: "",
  });
  const [lessonData, setLessonData] = useState({
    groupId: "",
    subjectId: "",
    date: "",
    time: "",
  });
  const [scheduleData, setScheduleData] = useState({
    day: "",
    time: "",
    subjectId: "",
  });
  const [examData, setExamData] = useState({
    examId: "",
    date: "",
    time: "",
    subjectId: "",
    groupId: "",
  });
  const [filters, setFilters] = useState({
    groupId: "",
    subjectId: "",
  });
  const [allGroups, setAllGroups] = useState([]);

  const fetchTeacherData = () => {
    apiClient.get(`/teachers/${teacherId}`).then((res) => setTeacher(res.data));
    apiClient
      .get(`/teachers/${teacherId}/subjects`)
      .then((res) => setSubjects(res.data));
    apiClient
      .get(`/teachers/${teacherId}/schedule`)
      .then((res) => setSchedule(res.data));
    apiClient.get(`/subjects`).then((res) => setAllSubjects(res.data));
    apiClient.get(`/groups`).then((res) => setAllGroups(res.data));
    fetchExams();
  };

  useEffect(() => {
    fetchGroupLessons();
    fetchTeacherData();
  }, [teacherId]);
  const fetchExams = () => {
    apiClient
      .get(`/exams`, {
        params: {
          teacherId,
          groupId: filters.groupId,
          date: filters.date,
        },
      })
      .then((res) => setExams(res.data))
      .catch(() => setExams([]));
  };

  useEffect(() => {
    fetchExams();
  }, [filters]);

  const fetchGroupLessons = () => {
    apiClient
      .get(`/groups/lessons`, { params: { teacherId } })
      .then((res) => setGroupLessons(res.data))
      .catch(() => setGroupLessons([]));
  };

  const handleAssessGroup = () => {
    if (!selectedLesson) {
      alert("Please select a group lesson.");
      return;
    }

    apiClient
      .post(`/groups/assess`, { recordId: selectedLesson })
      .then((res) => {
        fetchGroupLessons();
        setAssessmentMessage(res.data.message);
        fetchTeacherData();
        resetAssessModal();
      })
      .catch((err) => {
        setAssessmentMessage(err.response.data || "Failed to assess group.");
      });
  };

  const resetAddLessonModal = () => {
    setIsAddLessonModalOpen(false);
    setLessonData({ groupId: "", subjectId: "", date: "", time: "" });
  };

  const resetAddExamModal = () => {
    setIsAddExamModalOpen(false);
    setExamData({ groupId: "", subjectId: "", date: "", time: "" });
  };
  const handleAddLesson = () => {
    apiClient.post(`/groups/lessons`, { ...lessonData, teacherId }).then(() => {
      fetchGroupLessons();
      fetchTeacherData();
      resetAddLessonModal();
    });
  };

  const handleAddExam = () => {
    apiClient.post(`/exams`, { ...examData, teacherId }).then(() => {
      fetchExams();
      fetchTeacherData();
      resetAddExamModal();
    });
  };

  const resetAssessModal = () => {
    setIsAssessModalOpen(false);
    setSelectedLesson("");
    setAssessmentMessage("");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    fetchExams();
  };
  const availableSubjects = allSubjects.filter(
    (subject) =>
      !subjects.some(
        (teacherSubject) => teacherSubject.subject_id === subject.subject_id
      )
  );

  const handleSaveSubject = () => {
    if (editSubjectRecordId) {
      apiClient
        .put(
          `/teachers/${teacherId}/subjects/${editSubjectRecordId}`,
          subjectData
        )
        .then(fetchTeacherData);
    } else {
      apiClient
        .post(`/teachers/${teacherId}/subjects`, subjectData)
        .then(fetchTeacherData);
    }
    resetSubjectModal();
  };
  const handleSaveExam = () => {
    if (examData.examId) {
      apiClient
        .put(`/exams/${examData.examId}`, examData)
        .then(fetchTeacherData);
    } else {
      apiClient.post(`/exams`, examData).then(fetchTeacherData);
    }
    resetExamModal();
  };
  const handleUpdateTeacher = () => {
    apiClient.put(`/teachers/${teacherId}`, teacherData).then(fetchTeacherData);

    resetTeacherModal();
  };

  const handleSaveSchedule = () => {
    if (editScheduleRecordId) {
      apiClient
        .put(
          `/teachers/${teacherId}/schedule/${editScheduleRecordId}`,
          scheduleData
        )
        .then(fetchTeacherData);
    } else {
      apiClient
        .post(`/teachers/${teacherId}/schedule`, scheduleData)
        .then(fetchTeacherData);
    }
    resetScheduleModal();
  };

  const handleDeleteSubject = (recordId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      apiClient
        .delete(`/teachers/${teacherId}/subjects/${recordId}`)
        .then(fetchTeacherData);
    }
  };

  const handleDeleteSchedule = (recordId) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      apiClient
        .delete(`/teachers/${teacherId}/schedule/${recordId}`)
        .then(fetchTeacherData);
    }
  };

  const resetTeacherModal = () => {
    setIsTeacherModalOpen(false);
    setTeacherData({ firstName: "", lastName: "", age: 0 });
  };
  const resetExamModal = () => {
    setIsExamModalOpen(false);
    setExamData({ examId: "", date: "", time: "", subjectId: "", groupId: "" });
  };
  const resetSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setSubjectData({ subject_id: "", subject_name: "" });
    setEditSubjectRecordId(null);
  };

  const resetScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setScheduleData({ day: "", time: "", subjectId: "" });
    setEditScheduleRecordId(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {teacher.firstName} {teacher.lastName}
      </h1>

      <div className="mb-8">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold mb-4">Teacher Information</h2>
          <button
            className="px-4 py-2 bg-black-primary text-yellow-500 mb-4 rounded"
            onClick={() => {
              setTeacherData(teacher);
              setIsTeacherModalOpen(true);
            }}
          >
            Edit Info
          </button>
        </div>
        <table className="table-auto w-full border border-gray-300">
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-bold">ID</td>
              <td className="border px-4 py-2">{teacher.id}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-bold">First Name</td>
              <td className="border px-4 py-2">{teacher.firstName}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-bold">Last Name</td>
              <td className="border px-4 py-2">{teacher.lastName}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-bold">Age</td>
              <td className="border px-4 py-2">{teacher.age}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold">Subjects</h2>
          <button
            className="px-4 py-2 bg-black-primary text-yellow-500  rounded"
            onClick={() => setIsSubjectModalOpen(true)}
          >
            Add Subject
          </button>
        </div>
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-yellow-500 text-black">
              <th className="border px-4 py-2">Subject Name</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.recordId}>
                <td className="border px-4 py-2">{subject.subject_name}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-600 text-white rounded"
                    onClick={() => {
                      setSubjectData(subject);
                      setEditSubjectRecordId(subject.recordId);
                      setIsSubjectModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDeleteSubject(subject.recordId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold">Schedule</h2>
          <button
            className="px-4 py-2 bg-black-primary text-yellow-500  rounded"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Add Schedule
          </button>
        </div>
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-yellow-500 text-black">
              <th className="border px-4 py-2">Day</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Subject</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((lesson) => (
              <tr key={lesson.recordId}>
                <td className="border px-4 py-2">{lesson.day}</td>
                <td className="border px-4 py-2">{lesson.time}</td>
                <td className="border px-4 py-2">{lesson.subject_name}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-600 text-white rounded"
                    onClick={() => {
                      setScheduleData(lesson);
                      setEditScheduleRecordId(lesson.recordId);
                      setIsScheduleModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDeleteSchedule(lesson.recordId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-2 justify-end">
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded mb-4"
          onClick={() => setIsAddLessonModalOpen(true)}
        >
          Add Group Lesson
        </button>
        <button
          className="px-4 py-2 bg-black-primary text-white rounded mb-4 text-yellow-400"
          onClick={() => setIsAssessModalOpen(true)}
        >
          Assess Group
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Group Lessons</h2>
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-yellow-500 text-black">
              <th className="border px-4 py-2">Group</th>
              <th className="border px-4 py-2">Subject</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Assessed</th>
            </tr>
          </thead>
          <tbody>
            {groupLessons.length > 0 ? (
              groupLessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="border px-4 py-2">
                    {lesson.resolvedGroup.groupName}
                  </td>
                  <td className="border px-4 py-2">
                    {lesson?.resolvedSubject.subject_name}
                  </td>
                  <td className="border px-4 py-2">{lesson.date}</td>
                  <td className="border px-4 py-2">{lesson.time}</td>
                  <td className="border px-4 py-2 flex justify-center">
                    {lesson.assessed ? (
                      <TiTick size={32} color="green" />
                    ) : (
                      <RxCross1 size={28} color="red" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center">
                  No group lessons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isAssessModalOpen}
        closeModal={resetAssessModal}
        title="Assess Group"
        onSubmit={handleAssessGroup}
      >
        <label className="block mb-2 font-semibold">
          Select Unassessed Group Lesson
        </label>
        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          className="w-full border px-2 py-1 rounded mb-4"
        >
          <option value="">Select a lesson</option>
          {groupLessons
            .filter((lesson) => !lesson.assessed)
            .map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {`Group: ${lesson.resolvedGroup.groupName} - Date: ${lesson.date} - Subject: ${lesson?.resolvedSubject.subject_name}`}
              </option>
            ))}
        </select>

        {assessmentMessage && (
          <p className="text-green-500 text-sm">{assessmentMessage}</p>
        )}
      </Modal>
      <div className="mt-6 flex justify-between ">
        <div className="mb-4 flex space-x-4">
          <div>
            <label className="block font-semibold">Filter by Group</label>
            <select
              name="groupId"
              value={filters.groupId}
              onChange={handleFilterChange}
              className="border px-2 py-1 w-full"
            >
              <option value="">All Groups</option>
              {allGroups.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold">Filter by Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-black-primary text-yellow-500  rounded"
            onClick={() => setIsAddExamModalOpen(true)}
          >
            Add Exam
          </button>
        </div>
      </div>

      <Modal
        isOpen={isAddLessonModalOpen}
        closeModal={resetAddLessonModal}
        title="Add Group Lesson"
        onSubmit={handleAddLesson}
      >
        <select
          value={lessonData.groupId}
          onChange={(e) =>
            setLessonData({ ...lessonData, groupId: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select Group</option>
          {allGroups.map((group) => (
            <option key={group.groupId} value={group.groupId}>
              {group.groupName}
            </option>
          ))}
        </select>

        <select
          value={lessonData.subjectId}
          onChange={(e) =>
            setLessonData({ ...lessonData, subjectId: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={lessonData.date}
          onChange={(e) =>
            setLessonData({ ...lessonData, date: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />

        <input
          type="text"
          value={lessonData.time}
          onChange={(e) =>
            setLessonData({ ...lessonData, time: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
      </Modal>

      <Modal
        isOpen={isAddExamModalOpen}
        closeModal={resetAddExamModal}
        title="Add Exam"
        onSubmit={handleAddExam}
      >
        <select
          value={examData.groupId}
          onChange={(e) =>
            setExamData({ ...examData, groupId: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select Group</option>
          {allGroups.map((group) => (
            <option key={group.groupId} value={group.groupId}>
              {group.groupName}
            </option>
          ))}
        </select>

        <select
          value={examData.subjectId}
          onChange={(e) =>
            setExamData({ ...examData, subjectId: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={examData.date}
          onChange={(e) => setExamData({ ...examData, date: e.target.value })}
          className="border px-2 py-1 mb-2 w-full"
        />

        <input
          type="time"
          value={examData.time}
          onChange={(e) => setExamData({ ...examData, time: e.target.value })}
          className="border px-2 py-1 mb-2 w-full"
        />
      </Modal>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Exams</h2>
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-yellow-500 text-black">
              <th className="border px-4 py-2">Group</th>
              <th className="border px-4 py-2">Subject</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length > 0 ? (
              exams.map((exam) => (
                <tr key={exam.examId}>
                  <td className="border px-4 py-2">{exam.group.name}</td>
                  <td className="border px-4 py-2">{exam.subject.name}</td>
                  <td className="border px-4 py-2">{exam.date}</td>
                  <td className="border px-4 py-2">{exam.time}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="px-2 py-1 bg-yellow-600 text-white rounded"
                      onClick={() => {
                        setExamData(exam);
                        setIsExamModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() =>
                        apiClient
                          .delete(`/exams/${exam.examId}`)
                          .then(fetchExams)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="border px-4 py-2 text-center">
                  No exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isTeacherModalOpen}
        closeModal={resetTeacherModal}
        title={"Edit Teacher"}
        onSubmit={handleUpdateTeacher}
      >
        <input
          type="text"
          placeholder="First name"
          value={teacherData.firstName}
          onChange={(e) =>
            setTeacherData({ ...teacherData, firstName: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Last name"
          value={teacherData.lastName}
          onChange={(e) =>
            setTeacherData({ ...teacherData, lastName: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Age"
          value={teacherData.age}
          onChange={(e) =>
            setTeacherData({ ...teacherData, age: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
      </Modal>

      <Modal
        isOpen={isExamModalOpen}
        closeModal={resetExamModal}
        title={examData.examId ? "Edit Exam" : "Add Exam"}
        onSubmit={handleSaveExam}
      >
        <input
          type="text"
          placeholder="Date"
          value={examData.date}
          onChange={(e) => setExamData({ ...examData, date: e.target.value })}
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Time"
          value={examData.time}
          onChange={(e) => setExamData({ ...examData, time: e.target.value })}
          className="border px-2 py-1 mb-2 w-full"
        />
        <select
          value={examData.subjectId}
          onChange={(e) =>
            setExamData({
              ...examData,
              subjectId: e.target.value,
            })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select subject</option>
          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </Modal>

      <Modal
        isOpen={isSubjectModalOpen}
        closeModal={resetSubjectModal}
        title={editSubjectRecordId ? "Edit Subject" : "Add Subject"}
        onSubmit={handleSaveSubject}
      >
        <select
          value={subjectData.subject_id}
          onChange={(e) =>
            setSubjectData({
              ...subjectData,
              subject_id: e.target.value,
              subject_name: e.target.options[e.target.selectedIndex].text,
            })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select Subject</option>
          {availableSubjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </Modal>

      <Modal
        isOpen={isScheduleModalOpen}
        closeModal={resetScheduleModal}
        title={editScheduleRecordId ? "Edit Schedule" : "Add Schedule"}
        onSubmit={handleSaveSchedule}
      >
        <input
          type="text"
          placeholder="Day"
          value={scheduleData.day}
          onChange={(e) =>
            setScheduleData({ ...scheduleData, day: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Time"
          value={scheduleData.time}
          onChange={(e) =>
            setScheduleData({ ...scheduleData, time: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <select
          value={scheduleData.subjectId}
          onChange={(e) =>
            setScheduleData({ ...scheduleData, subjectId: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </Modal>
    </div>
  );
};

export default TeacherDetail;
