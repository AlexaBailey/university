import React, { useState, useEffect } from "react";
import axios from "axios";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [experienceYears, setExperience] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:4000/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const addEmployee = async () => {
    try {
      let fullname = name.split(" ");

      const response = await axios.post("http://localhost:4000/employees", {
        firstName: fullname[0],
        lastName: fullname[1],
        experienceYears,
        section,
      });
      setEmployees([...employees, response.data]);
      setName("");
      setSection("");
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6">Employees</h1>

      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Add New Employee
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-yellow-300"
          />
          <input
            type="number"
            placeholder="Experience"
            value={experienceYears}
            onChange={(e) => setExperience(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-yellow-300"
          />
          <input
            type="text"
            placeholder="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-yellow-300"
          />
          <button
            onClick={addEmployee}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 focus:outline-none"
          >
            Add Employee
          </button>
        </div>
      </div>

      <table className="table-auto w-full max-w-2xl bg-white shadow-md rounded-lg border border-gray-300">
        <thead className="bg-yellow-500 text-black">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Section</th>
            <th className="border px-4 py-2">Experience</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-yellow-50">
              <td className="border px-4 py-2">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="border px-4 py-2">{employee.section}</td>
              <td className="border px-4 py-2">{employee.experienceYears}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;
