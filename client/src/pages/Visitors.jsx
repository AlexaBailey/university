import React, { useState, useEffect } from "react";
import axios from "axios";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [name, setName] = useState("");
  const [registrationDate, setRegistration] = useState("");

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await axios.get("http://localhost:4000/visitors");
        setVisitors(response.data);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      }
    };
    fetchVisitors();
  }, []);

  const addVisitor = async () => {
    try {
      let fullname = name.split(" ");
      const response = await axios.post("http://localhost:4000/visitors", {
        firstName: fullname[0],
        lastName: fullname[1],

        registrationDate,
      });
      setVisitors([...visitors, response.data]);
      setName("");
      setRegistration("");
    } catch (error) {
      console.error("Error adding visitor:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6">Visitors</h1>

      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Add New Visitor
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
            type="text"
            placeholder="Registration Date"
            value={registrationDate}
            onChange={(e) => setRegistration(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-yellow-300"
          />
          <button
            onClick={addVisitor}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 focus:outline-none"
          >
            Add Visitor
          </button>
        </div>
      </div>

      <table className="table-auto w-full max-w-2xl bg-white shadow-md rounded-lg border border-gray-300">
        <thead className="bg-yellow-500 text-black">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Registered</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor.id} className="hover:bg-yellow-50">
              <td className="border px-4 py-2">
                {visitor.firstName} {visitor.lastName}
              </td>
              <td className="border px-4 py-2">{visitor.registrationDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Visitors;
