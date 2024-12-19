import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);

  const [studentData, setStudentData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    age: 0,
    group: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const fetchStudentData = () => {
    apiClient.get(`/students`).then((res) => setStudents(res.data));
    apiClient.get(`/groups`).then((res) => setGroups(res.data));
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const resetStudentData = () => {
    setIsOpen(false);
    setStudentData({
      firstName: "",
      lastName: "",
      age: 0,
      group: "",
    });
  };

  const handleSaveStudent = () => {
    if (studentData.id) {
      apiClient
        .put(`/students/${studentData.id}`, {
          ...studentData,
          groupId: studentData.group,
        })
        .then(fetchStudentData);
    } else {
      apiClient
        .post(`/students`, {
          ...studentData,
          groupId: studentData.group,
        })
        .then(fetchStudentData);
    }
    resetStudentData();
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      apiClient.delete(`/students/${id}`).then(fetchStudentData);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Students</h1>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-yellow-500 rounded"
          onClick={() => setIsOpen(true)}
        >
          Add Student
        </button>
      </div>
      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-yellow-500 text-black">
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Age</th>
            <th className="border px-4 py-2">Group</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              className="cursor-pointer hover:bg-yellow-100"
              onDoubleClick={() => navigate(`/students/${student.id}/grades`)}
              key={student.id}
            >
              <td className="border px-4 py-2">
                {student.firstName} {student.lastName}
              </td>
              <td className="border px-4 py-2">{student.age}</td>
              <td className="border px-4 py-2">{student.group.name}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  className="px-2 py-1 bg-yellow-600 text-white rounded"
                  onClick={() => {
                    setStudentData({
                      ...student,
                      group: student.group.groupId,
                    });
                    setIsOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDeleteStudent(student.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isOpen}
        closeModal={resetStudentData}
        title={studentData.id ? "Edit Student" : "Add Student"}
        onSubmit={handleSaveStudent}
      >
        <input
          type="text"
          placeholder="First name"
          value={studentData.firstName}
          onChange={(e) =>
            setStudentData({ ...studentData, firstName: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Last name"
          value={studentData.lastName}
          onChange={(e) =>
            setStudentData({ ...studentData, lastName: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Age"
          value={studentData.age}
          onChange={(e) =>
            setStudentData({ ...studentData, age: e.target.value })
          }
          className="border px-2 py-1 mb-2 w-full"
        />
        <select
          value={studentData.group}
          onChange={(e) =>
            setStudentData({
              ...studentData,
              group: e.target.value,
            })
          }
          className="border px-2 py-1 mb-2 w-full"
        >
          <option value="">
            {studentData.group
              ? groups.find((g) => g.groupId == studentData.group)?.name ||
                "Select Group"
              : "Select Group"}
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.groupName}
            </option>
          ))}
        </select>
      </Modal>
    </div>
  );
};

export default Students;
