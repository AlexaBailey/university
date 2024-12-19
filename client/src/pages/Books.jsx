import React, { useState, useEffect } from "react";
import axios from "axios";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:4000/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  const addBook = async () => {
    try {
      const response = await axios.post("http://localhost:4000/books", {
        title,
        author,
      });
      setBooks([...books, response.data]);
      setTitle("");
      setAuthor("");
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Books</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
          <button
            onClick={addBook}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
          >
            Add Book
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {books.map((book) => (
            <li
              key={book.id}
              className="py-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {book.title}
                </p>
                <p className="text-sm text-gray-500">by {book.author}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Books;
