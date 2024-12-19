import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Modal from "../components/Modal";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedSubject, setSelectedSubject] = useState({
    id: "",
    subject_name: "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await apiClient.get("/subjects");
      setSubjects(response.data);
    } catch (err) {
      setError(err.response?.data || "Failed to fetch subjects.");
    }
  };

  const handleAddOrUpdateSubject = async () => {
    try {
      if (modalType === "add") {
        await apiClient.post("/subjects", {
          subject_name: selectedSubject.subject_name,
        });
      } else {
        await apiClient.put(`/subjects/${selectedSubject.id}`, {
          subject_name: selectedSubject.subject_name,
        });
      }
      fetchSubjects();
      resetModal();
    } catch (err) {
      setError(err.response?.data || "Failed to save subject.");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await apiClient.delete(`/subjects/${subjectId}`);
        fetchSubjects();
      } catch (err) {
        setError(err.response?.data || "Failed to delete subject.");
      }
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setSelectedSubject({ id: "", subject_name: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setModalType("edit");
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setSelectedSubject({ id: "", subject_name: "" });
    setError("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Subjects Management</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="mb-4 px-4 py-2 bg-yellow-500  rounded hover:bg-green-600"
        >
          Add Subject
        </button>
      </div>

      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-yellow-500 text-black">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Subject Name</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="border px-4 py-2 text-center">{subject.id}</td>
                <td className="border px-4 py-2 text-center">
                  {subject.subject_name}
                </td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => openEditModal(subject)}
                    className="px-2 py-1 bg-yellow-600 text-yellow-100   rounded hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="px-2 py-1 bg-red-500 text-yellow-100 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4">
                No subjects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          closeModal={resetModal}
          title={modalType === "add" ? "Add Subject" : "Edit Subject"}
          onSubmit={handleAddOrUpdateSubject}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Subject Name
            </label>
            <input
              type="text"
              value={selectedSubject.subject_name}
              onChange={(e) =>
                setSelectedSubject({
                  ...selectedSubject,
                  subject_name: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter subject name"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SubjectsPage;
