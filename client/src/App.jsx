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
