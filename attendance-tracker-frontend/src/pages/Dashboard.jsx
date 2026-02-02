import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get("/classes/my");
        setClasses(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClasses();
  }, []);


  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
  };

const handleDelete = async (classId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this class?\nAll attendance will be lost!"
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`/classes/delete/${classId}`);
    alert("Class deleted successfully");

    // 🔄 Refresh classes
    setClasses(prev => prev.filter(c => c._id !== classId));

  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  }
};


  return (
    <div className="dashboard">
      <button
          className="btn btn-create"
          onClick={() => navigate("/create-class")}
        >
          + Create New Class
        </button>
        <button
        className="btn"
        onClick={() => navigate("/overall-attendance")}
        >
        Overall Attendance
        </button>
     <button
  className="btn logout-btn"
  style={{ float: "right", marginBottom: "10px" }}
  onClick={handleLogout}
>
  Logout
</button> 
 
      <h2>My Classes</h2>    

      {classes.length === 0 && (
  <div style={{ textAlign: "center", marginTop: "30px" }}>
    <p>No classes created yet.</p>

    <button
      className="btn btn-create"
      onClick={() => navigate("/create-class")}
      style={{ marginTop: "10px" }}
    >
      + Create Your First Class
    </button>
    <button
  className="btn"
  onClick={() => navigate("/overall-attendance")}
>
  Overall Attendance
</button>

  </div>
)}


      {classes.map((cls) => (
        <div
          key={cls._id}
          className="class-card">
        
          <h3>{cls.className}</h3>
          <p>Subject: {cls.subject}</p>
          <p>
            Class Code: <b>{cls.classCode}</b>
          </p>

          {/* ✅ STUDENT JOIN LINK */}
          <p>
            Student Join Link:
            
            <a
             className="join-link"
              href={`http://localhost:5173/join/${cls.classCode}`}
              target="_blank"
              rel="noreferrer"
            >
              Join Here
            </a>
          </p>

           <button
              className="btn"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate(`/edit-class/${cls._id}`)}
            >
              ✏️ Edit Class
            </button>
            <button
              className="btn danger"
              style={{ marginLeft: "10px" }}
              onClick={() => handleDelete(cls._id)}
            >
              🗑 Delete
            </button>


          <button
          className="btn btn-view"
          onClick={() => navigate(`/class/${cls._id}`)}
        >
          View Attendance
        </button>

        
        

        </div>
      ))}
    </div>
  );
}

export default Dashboard;