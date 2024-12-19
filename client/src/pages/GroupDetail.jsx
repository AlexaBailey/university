import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

const GroupDetail = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState({});
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    apiClient.get(`/groups/${groupId}`).then((res) => setGroup(res.data));
    apiClient
      .get(`/groups/${groupId}/students`)
      .then((res) => setStudents(res.data))
      .catch(() => setStudents([]));
    apiClient
      .get(`/exams`, { params: { groupId } })
      .then((res) => setExams(res.data))
      .catch(() => setExams([]));
    apiClient
      .get(`/groups/lessons`, { params: { groupId } })
      .then((res) => setAssessments(res.data))
      .catch(() => setAssessments([]));
  }, [groupId]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Group Details</h1>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Group Information</h2>
        <table className="table-auto w-full border border-gray-300">
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-semibold">Group ID</td>
              <td className="border px-4 py-2">{group.id}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Group Name</td>
              <td className="border px-4 py-2">{group.groupName}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Students</h2>
        {students.length > 0 ? (
          <table className="table-auto w-full border border-gray-300">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">First Name</th>
                <th className="border px-4 py-2">Last Name</th>
                <th className="border px-4 py-2">Age</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border px-4 py-2">{student.id}</td>
                  <td className="border px-4 py-2">{student.firstName}</td>
                  <td className="border px-4 py-2">{student.lastName}</td>
                  <td className="border px-4 py-2">{student.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students assigned to this group.</p>
        )}
      </div>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Exams</h2>
        {exams.length > 0 ? (
          <table className="table-auto w-full border border-gray-300">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="border px-4 py-2">Exam ID</th>
                <th className="border px-4 py-2">Subject</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.examId}>
                  <td className="border px-4 py-2">{exam.id}</td>
                  <td className="border px-4 py-2">
                    {exam.subject?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{exam.date}</td>
                  <td className="border px-4 py-2">{exam.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No exams scheduled for this group.</p>
        )}
      </div>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Assessments</h2>
        {assessments.length > 0 ? (
          <table className="table-auto w-full border border-gray-300">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="border px-4 py-2">Lesson ID</th>
                <th className="border px-4 py-2">Subject</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((lesson) => (
                <tr
                  className="cursor-pointer hover:bg-yellow-500"
                  onClick={() => navigate(`/assessments/${lesson.id}`)}
                  key={lesson.id}
                >
                  <td className="border px-4 py-2">{lesson.id}</td>
                  <td className="border px-4 py-2">{lesson.subject_name}</td>
                  <td className="border px-4 py-2">{lesson.date}</td>
                  <td className="border px-4 py-2">{lesson.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No assessments recorded for this group.</p>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
