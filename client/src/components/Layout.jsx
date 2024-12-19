import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-light text-black-primary">
      <nav className="w-64 bg-black-primary text-white-primary p-6">
        <h2 className="text-xl font-bold mb-6 text-yellow-primary">
          Allen University
        </h2>
        <ul className="space-y-4">
          <li>
            <Link to="/" className="hover:text-yellow-primary">
              Home
            </Link>
          </li>
          <li>
            <Link to="/teachers" className="hover:text-yellow-primary">
              Teachers
            </Link>
          </li>
          <li>
            <Link to="/students" className="hover:text-yellow-primary">
              Students
            </Link>
          </li>
          <li>
            <Link to="/groups" className="hover:text-yellow-primary">
              Groups
            </Link>
          </li>
          <li>
            <Link to="/subjects" className="hover:text-yellow-primary">
              Subjects
            </Link>
          </li>
          <li>
            <Link to="/admin" className="hover:text-yellow-primary">
              Admin
            </Link>
          </li>

          <li>
            <Link to="/books" className="hover:text-yellow-primary">
              Books
            </Link>
          </li>
          <li>
            <Link to="/employees" className="hover:text-yellow-primary">
              Employees
            </Link>
          </li>
          <li>
            <Link to="/visitors" className="hover:text-yellow-primary">
              Visitors
            </Link>
          </li>
          <li>
            <Link to="/borrowed-books" className="hover:text-yellow-primary">
              Borrowed Books
            </Link>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default Layout;
