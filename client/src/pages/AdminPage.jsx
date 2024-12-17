import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import DynamicFormModal from "../components/DynamicFormModal";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("Students");
  const [data, setData] = useState({
    students: [],
    teachers: [],
    groups: [],
    exams: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [submitHandler, setSubmitHandler] = useState(() => {});

  const fetchData = () => {
    apiClient
      .get("/students")
      .then((res) => setData((prev) => ({ ...prev, students: res.data })));
    apiClient
      .get("/teachers")
      .then((res) => setData((prev) => ({ ...prev, teachers: res.data })));
    apiClient
      .get("/groups")
      .then((res) => setData((prev) => ({ ...prev, groups: res.data })));
    apiClient
      .get("/exams")
      .then((res) => setData((prev) => ({ ...prev, exams: res.data })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = (entity) => {
    switch (entity) {
      case "Students":
        setModalTitle("Add Student");
        setFormFields([
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
          {
            name: "groupId",
            label: "Group",
            type: "select",
            options: data.groups.map((g) => ({
              value: g.groupId,
              label: g.groupName,
            })),
          },
        ]);
        setSubmitHandler((formData) =>
          apiClient.post("/students", formData).then(() => fetchData())
        );
        break;

      case "Teachers":
        setModalTitle("Add Teacher");
        setFormFields([
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
        ]);
        setSubmitHandler((formData) =>
          apiClient.post("/teachers", formData).then(() => fetchData())
        );
        break;

      case "Groups":
        setModalTitle("Add Group");
        setFormFields([
          {
            name: "groupName",
            label: "Group Name",
            type: "text",
            required: true,
          },
        ]);
        setSubmitHandler((formData) =>
          apiClient.post("/groups", formData).then(() => fetchData())
        );
        break;

      case "Exams":
        setModalTitle("Add Exam");
        setFormFields([
          {
            name: "groupId",
            label: "Group",
            type: "select",
            options: data.groups.map((g) => ({
              value: g.groupId,
              label: g.groupName,
            })),
          },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "time", label: "Time", type: "time", required: true },
        ]);
        setSubmitHandler((formData) =>
          apiClient.post("/exams", formData).then(() => fetchData())
        );
        break;

      default:
        break;
    }
    setIsModalOpen(true);
  };

  const renderTable = () => {
    switch (activeTab) {
      case "Students":
        return (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-yellow-500">
                <th className="border px-4 py-2">Full Name</th>
                <th className="border px-4 py-2">Age</th>
                <th className="border px-4 py-2">Group</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr key={student.id}>
                  <td className="border px-4 py-2">{`${student.firstName} ${student.lastName}`}</td>
                  <td className="border px-4 py-2">{student.age}</td>
                  <td className="border px-4 py-2">
                    {student.group?.groupName || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "Teachers":
        return (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-yellow-500">
                <th className="border px-4 py-2">Full Name</th>
              </tr>
            </thead>
            <tbody>
              {data.teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="border px-4 py-2">{`${teacher.firstName} ${teacher.lastName}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "Groups":
        return (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-yellow-500">
                <th className="border px-4 py-2">Group Name</th>
              </tr>
            </thead>
            <tbody>
              {data.groups.map((group) => (
                <tr key={group.groupId}>
                  <td className="border px-4 py-2">{group.groupName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "Exams":
        return (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-yellow-500">
                <th className="border px-4 py-2">Group</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.exams.map((exam) => (
                <tr key={exam.examId}>
                  <td className="border px-4 py-2">{exam.group?.groupName}</td>
                  <td className="border px-4 py-2">{exam.date}</td>
                  <td className="border px-4 py-2">{exam.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex mb-4 space-x-4">
        {["Students", "Teachers", "Groups", "Exams"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <button
        className="px-4 py-2 bg-green-500 text-white rounded mb-4"
        onClick={() => openAddModal(activeTab)}
      >
        Add {activeTab}
      </button>

      {renderTable()}

      <DynamicFormModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        title={modalTitle}
        fields={formFields}
        onSubmit={submitHandler}
      />
    </div>
  );
};

export default AdminPage;