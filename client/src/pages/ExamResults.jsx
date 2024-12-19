import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const ExamResults = () => {
  const [examResults, setExamResults] = useState([]);

  useEffect(() => {
    const fetchExamResults = () => {
      apiClient.get(`/exams/results`).then((res) => setExamResults(res.data));
    };

    fetchExamResults();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6">Exam Results</h1>
      <table className="table-auto w-full max-w-4xl bg-white shadow-md rounded-lg border border-gray-300">
        <thead className="bg-yellow-500 text-black">
          <tr>
            <th className="border px-4 py-2">Student</th>
            <th className="border px-4 py-2">Mark</th>
            <th className="border px-4 py-2">Group</th>
            <th className="border px-4 py-2">Subject</th>
          </tr>
        </thead>
        <tbody>
          {examResults.length > 0 ? (
            examResults.map((result) => (
              <tr key={result.student.id} className="hover:bg-yellow-50">
                <td className="border px-4 py-2">{result.student.name}</td>
                <td className="border px-4 py-2">{result.mark}</td>
                <td className="border px-4 py-2">{result.group.name}</td>
                <td className="border px-4 py-2">{result.subject.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border px-4 py-2 text-center">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExamResults;
