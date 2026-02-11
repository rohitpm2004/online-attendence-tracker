 
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const { branchId } = useParams();          // ⭐ get branch id
 const [branchName, setBranchName] = useState("");


  /* ================= FETCH CLASSES (BY BRANCH) ================= */

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get(`/classes/my?branchId=${branchId}`);
        setClasses(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (branchId) fetchClasses();
  }, [branchId]);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* ================= DELETE CLASS ================= */

  const handleDelete = async (classId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this class?\nAll attendance will be lost!"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/classes/delete/${classId}`);
      setClasses(prev => prev.filter(c => c._id !== classId));
      alert("Class deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };



  useEffect(() => {
  const fetchBranch = async () => {
    try {
      const res = await API.get(`/branches/${branchId}`);
      setBranchName(res.data.name);
    } catch (err) {
      console.log(err);
      setBranchName("Branch");
    }
  };

  if (branchId) fetchBranch();
}, [branchId]);

  /* ================= UI ================= */

  return (
    <div className="dashboard">
      <button className="btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      {/* TOP BAR */}
      <div className="dashboard-top">
         
        <h2 className="class-h2">
          {branchName} Classes
        </h2>

        <div className="dashboard-actions">
          
          <button
            className="btn btn-create"
            onClick={() => navigate(`/create-class/${branchId}`)}
          >
            + Create Class
          </button>

          <button
            className="btn btn-view"
            onClick={() => navigate(`/overall-attendance/${branchId}`)}
          >
            Attendance
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {classes.length === 0 && (
        <div className="empty-state">
          <p>No classes created in this branch</p>
          <button
            className="btn btn-create"
            onClick={() => navigate(`/create-class/${branchId}`)}
          >
            Create First Class
          </button>
        </div>
      )}

      {/* CLASSES GRID */}
      <div className="classes-grid">
        {classes.map((cls) => (
          <div key={cls._id} className="class-card">

            <div className="class-info">
              <h3>{cls.className}</h3>
              <p>Subject: {cls.subject}</p>
              <p>Code: <b>{cls.classCode}</b></p>

              <Link to={`/join/${cls.classCode}`} className="join-btn">
                Student Join Link
              </Link>
            </div>

            <div className="card-actions">
              <button
                className="btn btn-view"
                onClick={() => navigate(`/class/${cls._id}`)}
              >
                View
              </button>

              <button
                className="btn btn-create"
                onClick={() => navigate(`/edit-class/${cls._id}`)}
              >
                Edit
              </button>

              <button
                className="btn danger"
                onClick={() => handleDelete(cls._id)}
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;
