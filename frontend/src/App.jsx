import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Users from "./pages/Users.jsx";
import Children from "./pages/Children.jsx";
import Ebis from "./pages/Ebis.jsx";
import EbiDetail from "./pages/EbiDetail.jsx";
import EbiReport from "./pages/EbiReport.jsx";
import GeneralReport from "./pages/GeneralReport.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/ebis" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} />
        <Route path="/children" element={<Children />} />
        <Route path="/ebis" element={<Ebis />} />
        <Route path="/ebis/:id" element={<EbiDetail />} />
        <Route path="/reports/ebi/:id" element={<EbiReport />} />
        <Route path="/reports/general" element={<GeneralReport />} />
      </Route>
    </Routes>
  );
}
