import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const AssessmentDetails = () => {
  const { groupLessonId } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    apiClient
      .get(`/groups/assessments/${groupLessonId}`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, [groupLessonId]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Assessment Details</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-yellow-500 text-black">
            <th className="border px-4 py-2">Student ID</th>
            <th className="border px-4 py-2">Student Name</th>
            <th className="border px-4 py-2">Mark</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.studentId}>
                <td className="border px-4 py-2 text-center">
                  {student.studentId}
                </td>
                <td className="border px-4 py-2 text-center">
                  {student.studentName}
                </td>
                <td className="border px-4 py-2 text-center">{student.mark}</td>
              </tr>
            ))
          ) : (
            <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
              No marks per this assessment yet
            </td>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentDetails;
