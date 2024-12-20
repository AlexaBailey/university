import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import apiClient from "../api/apiClient";

const ExamResults = () => {
  const { examId, groupId, studentId, teacherId } = useParams();
  const [searchParams] = useSearchParams();
  const [examResults, setExamResults] = useState([]);

  useEffect(() => {
    const fetchExamResults = async () => {
      try {
        const params = {
          examId: examId || searchParams.get("examId"),
          groupId: groupId || searchParams.get("groupId"),
          studentId: studentId || searchParams.get("studentId"),
          teacherId: teacherId || searchParams.get("teacherId"),
        };

        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== undefined && v !== null
          )
        );

        const response = await apiClient.get("/exams/results", {
          params: filteredParams,
        });

        setExamResults(response.data);
      } catch (error) {
        console.error("Error fetching exam results:", error.message);
      }
    };

    fetchExamResults();
  }, [examId, groupId, studentId, teacherId, searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Exam Results</h1>
        {examResults.length === 0 ? (
          <p className="text-gray-600">
            No results found for the specified criteria.
          </p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Student</th>
                <th className="border px-4 py-2">Group</th>
                <th className="border px-4 py-2">Subject</th>
                <th className="border px-4 py-2">Teacher</th>

                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Mark</th>
              </tr>
            </thead>
            <tbody>
              {examResults.map((result) => (
                <tr key={result.recordId} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{result.student.name}</td>
                  <td className="border px-4 py-2">{result.group.name}</td>
                  <td className="border px-4 py-2">{result.subject.name}</td>
                  <td className="border px-4 py-2">{result.teacher.name}</td>

                  <td className="border px-4 py-2">{result.date}</td>
                  <td className="border px-4 py-2">{result.time}</td>
                  <td className="border px-4 py-2">{result.mark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExamResults;
