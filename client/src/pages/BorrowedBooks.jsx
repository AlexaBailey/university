import React, { useState, useEffect } from "react";
import axios from "axios";

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [visitors, setVisitors] = useState([]);

  const [bookId, setBookId] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchBooksData = async () => {
      try {
        const booksResponse = await axios.get("http://localhost:4000/books");
        setBooks(booksResponse.data);

        const borrowedBooksResponse = await axios.get(
          "http://localhost:4000/taken-books"
        );
        setBorrowedBooks(borrowedBooksResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchVisitors = async () => {
      try {
        const visitorsResponse = await axios.get(
          "http://localhost:4000/visitors"
        );
        setVisitors(visitorsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchVisitors();
    fetchBooksData();
  }, []);

  const borrowBook = async () => {
    if (!bookId || !userId || !date) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:4000/books/${bookId}`,
        {
          status: "taken",
          userId,
          date,
        }
      );
      setBorrowedBooks([...borrowedBooks, response.data]);
      setBookId("");
      setUserId("");
      setDate("");
    } catch (error) {
      console.error("Error borrowing book:", error);
    }
  };

  const returnBook = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:4000/books/${id}`, {
        status: "available",
      });
      setBorrowedBooks(borrowedBooks.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error returning book:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Borrowed Books
        </h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Borrow a Book
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              <option value="">Select a Book</option>
              {books
                .filter((book) => book.status === "available")
                .map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
            </select>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-yellow-300"
            >
              <option value="">Select Visitor</option>
              {visitors.map((visitor) => (
                <option key={visitor.id} value={visitor.id}>
                  {visitor.firstName} {visitor.lastName}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
            <button
              onClick={borrowBook}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              Borrow Book
            </button>
          </div>
        </div>

        <table className="table-auto w-full border border-gray-300">
          <thead className="bg-yellow-500 text-black">
            <tr>
              <th className="border px-4 py-2">Book Title</th>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Borrowed Date</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50 transition">
                <td className="border px-4 py-2">{book.title}</td>
                <td className="border px-4 py-2">{book.userId}</td>
                <td className="border px-4 py-2">{book.date}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => returnBook(book.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Return Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BorrowedBooks;
