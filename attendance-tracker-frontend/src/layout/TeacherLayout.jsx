import { Outlet } from "react-router-dom";
import Navbar from "../pages/Navbar";

function TeacherLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default TeacherLayout;
