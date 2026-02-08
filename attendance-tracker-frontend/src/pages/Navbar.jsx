import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const teacher = JSON.parse(localStorage.getItem("teacher"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacher");
    navigate("/");
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <div className="nav-left">
        <img src={logo} alt="logo" className="logo" />
        <span className="brand">BARABARI</span>
      </div>

      {/* CENTER */}
      <div className="nav-center">
        <h2 className="main-h2">Attendance Tracker</h2>
      </div>

      {/* RIGHT */}
      <div className="nav-right">

        <div className="profile" onClick={() => setOpen(!open)}>
          <div className="avatar">
            {teacher?.name?.charAt(0) || "T"}
          </div>

          <div className="teacher-info">
            <span className="teacher-name">
              {teacher?.name || "Teacher"}
            </span>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {open && (
          <div className="profile-menu">
            <p>{teacher?.name || "Teacher"}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}

      </div>

    </div>
  );
}

export default Navbar;
