import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import TeacherDetail from "./pages/TeacherDetail";
import Students from "./pages/Students";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import AssessmentDetails from "./pages/AssessmentDetails";
import StudentGrades from "./pages/StudentGrades";
import SubjectsPage from "./pages/SubjectsPage";
import AdminPage from "./pages/AdminPage";
import Books from "./pages/Books";
import Employees from "./pages/Employees";
import Visitors from "./pages/Visitors";
import BorrowedBooks from "./pages/BorrowedBooks";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:id" element={<TeacherDetail />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id/grades" element={<StudentGrades />} />

          <Route path="/groups" element={<Groups />} />

          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/books" element={<Books />} />
          <Route path="/borrowed-books" element={<BorrowedBooks />} />

          <Route path="/employees" element={<Employees />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route
            path="/assessments/:groupLessonId"
            element={<AssessmentDetails />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
