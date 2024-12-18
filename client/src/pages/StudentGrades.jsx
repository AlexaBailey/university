import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

const StudentGrades = () => {
  const { id } = useParams();
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState({});

  const [averageMark, setAverageMark] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get(`/students/${id}`).then((r) => setStudent(r.data));
    fetchStudentGrades();
  }, [id]);

  const fetchStudentGrades = async () => {
    try {
      const response = await apiClient.get(`/students/${id}/grades`);
      setGrades(response.data.records);
      setAverageMark(response.data.averageMark);
    } catch (err) {
      setError(err.response?.data || "Failed to fetch grades.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{student.firstName}'s Grades</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mb-4 text-lg font-semibold">
            Average Grade:{" "}
            <span className="bg-black-primary px-4 py-1 rounded text-yellow-400">
              {averageMark || "N/A"}
            </span>
          </div>

          <table className="table-auto w-full border border-gray-300">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Subject</th>
                <th className="border px-4 py-2">Mark</th>
                <th className="border px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? (
                grades.map((grade, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border px-4 py-2 text-center">
                      {grade.type}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {grade.subject_name}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {grade.mark}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {grade.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No grades found for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default StudentGrades;
