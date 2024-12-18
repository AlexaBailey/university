import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import DynamicFormModal from "../components/DynamicFormModal";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeachers = () => {
    apiClient.get("/teachers").then((res) => setTeachers(res.data));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDeleteTeacher = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      apiClient.delete(`/teachers/${id}`).then(() => {
        fetchTeachers();
      });
    }
  };

  const handleAddTeacher = (data) => {
    apiClient.post("/teachers", data).then(() => {
      fetchTeachers();
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teachers</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-yellow-500 text-black-primary rounded hover:bg-yellow-600"
        >
          Add Teacher
        </button>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-yellow-500 text-black">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td className="border px-4 py-2 text-center">{teacher.id}</td>
              <td className="border px-4 py-2 text-center">
                {teacher.firstName} {teacher.lastName}
              </td>
              <td className="border px-4 py-2 text-center space-x-5">
                <Link
                  to={`/teachers/${teacher.id}`}
                  className="text-yellow-100 bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDeleteTeacher(teacher.id)}
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-700 text-white-primary"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DynamicFormModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        title="Add Teacher"
        fields={[
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
          },
          { name: "age", label: "Age", type: "number", required: true },
        ]}
        onSubmit={handleAddTeacher}
      />
    </div>
  );
};

export default Teachers;
