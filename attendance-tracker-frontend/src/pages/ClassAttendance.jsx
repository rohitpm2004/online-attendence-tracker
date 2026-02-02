import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";

import API from "../services/api";
import "./ClassAttendance.css";

function ClassAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [groupWise, setGroupWise] = useState({});
  const [collegeWise, setCollegeWise] = useState({});
  const [loading, setLoading] = useState(true);

  // ================= FETCH BASIC ATTENDANCE =================
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await API.get(`/attendance/class/${id}`);
        setAttendance(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAttendance();
  }, [id]);

  // ================= FETCH SUMMARY =================
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get(`/attendance/summary/${id}`);
        setSummary(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchSummary();
  }, [id]);

  // ================= FETCH GROUP WISE =================
  useEffect(() => {
    const fetchGroupWise = async () => {
      try {
        const res = await API.get(`/attendance/group-wise/${id}`);
        setGroupWise(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchGroupWise();
  }, [id]);

  // ================= FETCH COLLEGE → GROUP WISE =================
  useEffect(() => {
    const fetchCollegeWise = async () => {
      try {
        const res = await API.get(`/attendance/college-group-wise/${id}`);
        setCollegeWise(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollegeWise();
  }, [id]);

  // ================= EXPORT =================
  const handleExport = async () => {
    try {
      const res = await API.get(`/attendance/export/${id}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err);
    }
  };

  return (
  <div className="page">
    <h2>Class Attendance</h2>
    <button
  className="btn"
  style={{ marginBottom: "15px", marginRight: "10px" }}
  onClick={() => navigate("/dashboard")}
>
  ← Back to Dashboard
</button>

    <button className="btn" onClick={handleExport}>
      Export Excel
    </button>

    {!loading && attendance.length === 0 && (
  <div className="card">
    <h3>No Attendance Yet</h3>
    <p>No students have joined this class yet.</p>

    <button
      className="btn"
      style={{ marginTop: "10px" }}
      onClick={() => navigate("/dashboard")}
    >
      ← Back to Dashboard
    </button>
  </div>
)}


    {!loading && attendance.length > 0 && (
      <div className="card">
        <h3>Attendance Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Group</th>
              <th>College</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record, index) => {
  if (!record.student) return null; // ✅ skip broken record

  const date = new Date(record.createdAt);

  return (
    <tr key={record._id}>
      <td>{index + 1}</td>
      <td>{record.student.fullName}</td>
      <td>{record.student.email}</td>
      <td>{record.student.group}</td>
      <td>{record.student.college}</td>
      <td>{date.toLocaleDateString()}</td>
      <td>{date.toLocaleTimeString()}</td>
    </tr>
  );
})}

          </tbody>
        </table>
      </div>
    )}

    {!loading && summary.length > 0 && (
      <div className="card">
        <h3>Attendance Summary</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Group</th>
              <th>College</th>
              <th>Attendance</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s, index) => (
              <tr key={index}>
                <td>{s.fullName}</td>
                <td>{s.email}</td>
                <td>{s.group}</td>
                <td>{s.college}</td>
                <td>{s.attendanceCount}</td>
                <td>{s.totalClasses}</td>
                <td>{s.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}


    {!loading && Object.keys(collegeWise).length > 0 && (
      <div className="card">
        <h3>College → Group-wise Attendance</h3>

        {Object.keys(collegeWise).map((college) => (
          <div key={college} className="college">
            <h3>{college}</h3>

            {Object.keys(collegeWise[college]).map((group) => (
              <div key={group} className="group">
                <h4>{group}</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collegeWise[college][group].map((s, index) => (
                      <tr key={index}>
                        <td>{s.fullName}</td>
                        <td>{s.email}</td>
                        <td>{s.attendanceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
);

}

export default ClassAttendance;
