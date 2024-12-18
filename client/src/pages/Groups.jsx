import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import DynamicFormModal from "../components/DynamicFormModal";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const groupsData = await apiClient.get("/groups");
      const studentsData = await apiClient.get("/students");
      const groupLessonsData = await apiClient.get("/groups/lessons");

      const enrichedGroups = groupsData.data.map((group) => {
        const studentCount = studentsData.data.filter(
          (student) => student.group.groupId === group.groupId
        ).length;

        const lessonCount = groupLessonsData.data.filter(
          (lesson) => lesson.groupId === group.groupId
        ).length;

        return {
          ...group,
          studentCount,
          lessonCount,
        };
      });

      setGroups(enrichedGroups);
    } catch (error) {
      console.error("Error fetching group data:", error.message);
    }
  };

  const handleAddGroup = (data) => {
    apiClient.post("/groups", data).then(() => {
      fetchGroups();
      setIsModalOpen(false);
    });
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      apiClient.delete(`/groups/${groupId}`).then(() => {
        fetchGroups();
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Groups</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-yellow-500 rounded hover:text-white-primary"
        >
          Add Group
        </button>
      </div>

      <ul>
        {groups.map((group) => (
          <li
            key={group.groupId}
            className="p-4 bg-white rounded shadow mb-4 flex justify-between items-center"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                {group.groupName} (ID: {group.groupId})
              </h2>
              <p>Number of Students: {group.studentCount}</p>
              <p>Number of Lessons: {group.lessonCount}</p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/groups/${group.groupId}`}
                className="px-4 py-2 bg-yellow-500 text-yellow-100 rounded hover:bg-yellow-600"
              >
                View Details
              </Link>
              <button
                onClick={() => handleDeleteGroup(group.groupId)}
                className="px-4 py-2 bg-red-500 text-yellow-100  rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <DynamicFormModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        title="Add Group"
        fields={[
          {
            name: "groupName",
            label: "Group Name",
            type: "text",
            required: true,
            placeholder: "Enter group name",
          },
        ]}
        onSubmit={handleAddGroup}
      />
    </div>
  );
};

export default Groups;
