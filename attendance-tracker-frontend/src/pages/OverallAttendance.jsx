import { useEffect, useState } from "react";
import API from "../services/api";
import "./OverallAttendance.css";
import { useNavigate } from "react-router-dom";
function OverallAttendance() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/attendance/overall")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  const exportExcel = async () => {
  try {
    const res = await API.get("/attendance/overall/export", {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "overall_attendance.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
    alert("Failed to export");
  }
};


  return (
    <div className="overall-page">
      <h2>Overall Student Attendance</h2>

      <button className="export-btn" onClick={exportExcel}>
        Export Overall Excel
      </button>
      <button
      className="btn"
  style={{ marginLeft: "10px" }}
  onClick={() => navigate("/dashboard")}
>
  ← Back to Dashboard
</button>

      <div className="table-container">
        <table className="overall-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Group</th>
              <th>College</th>
              <th>Total Classes Joined</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No attendance data available
                </td>
              </tr>
            ) : (
              data.map((s, i) => (
                <tr key={i}>
                  <td>{s.fullName}</td>
                  <td>{s.email}</td>
                  <td>{s.group}</td>
                  <td>{s.college}</td>
                  <td>{s.totalClassesJoined}</td>
                  <td>{s.classes.join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OverallAttendance;