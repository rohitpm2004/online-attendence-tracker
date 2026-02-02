import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateClass from "./pages/CreateClass";
import ClassAttendance from "./pages/ClassAttendance";
import JoinClass from "./pages/JoinClass";
import OverallAttendance from "./pages/OverallAttendance";
import EditClass from "./pages/EditClass";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-class" element={<CreateClass />} />  
        <Route path="/class/:id" element={<ClassAttendance />} />
        <Route path="/join/:classCode" element={<JoinClass />} />
        <Route path="/overall-attendance" element={<OverallAttendance />} />
        <Route path="/edit-class/:id" element={<EditClass />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
