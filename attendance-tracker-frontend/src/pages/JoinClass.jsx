import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import "./JoinClass.css";

const JoinClass = () => {
  const { classCode } = useParams();

  const savedProfile = JSON.parse(localStorage.getItem("studentProfile"));

  const [formData, setFormData] = useState({
    fullName: savedProfile?.fullName || "",
    email: savedProfile?.email || "",
    group: savedProfile?.group || "",
    college: savedProfile?.college || ""
  });

  const [classInfo, setClassInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ================= FETCH CLASS INFO ================= */

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await API.get(`/classes/by-code/${classCode}`);
        setClassInfo(res.data);
      } catch {
        setError("Invalid or expired class link");
        setExpired(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classCode]);

  /* ================= COUNTDOWN ================= */

  /* ================= COUNTDOWN (FIXED TIMEZONE) ================= */

useEffect(() => {
  if (!classInfo?.expiresAt) return;

  const expiryUTC = new Date(classInfo.expiresAt).getTime();

  const interval = setInterval(() => {
    const nowUTC = Date.now(); // always UTC safe
    const diff = expiryUTC - nowUTC;

    if (isNaN(diff)) return;

    if (diff <= 0) {
      setExpired(true);
      setTimeLeft("Expired");
      clearInterval(interval);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
  }, 1000);

  return () => clearInterval(interval);
}, [classInfo]);


  /* ================= INPUT HANDLER ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === "email" ? value.toLowerCase() : value
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (expired) return;

    setError("");
    setMessage("");

    try {
      const res = await API.post("/attendance/mark", {
        ...formData,
        classCode
      });

      localStorage.setItem("studentProfile", JSON.stringify(formData));

      setMessage(res.data.message || "Attendance marked successfully");

      if (res.data.meetLink) {
        setTimeout(() => window.open(res.data.meetLink, "_blank"), 800);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark attendance");
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="join-page">
        <div className="join-card">
          <p>Loading class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="join-page">
      <div className="join-card">

        <h2>{classInfo?.className || "Class"}</h2>
        <p><b>Subject:</b> {classInfo?.subject}</p>

        {/* COUNTDOWN */}
        {!expired ? (
          <p className="countdown">⏳ Time left: {timeLeft}</p>
        ) : (
          <p className="expired">❌ Class link expired</p>
        )}

        {/* PREFILL INFO */}
        {savedProfile && !expired && (
          <p className="prefill-note">
            Details auto-filled — please verify before submitting
          </p>
        )}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {!expired && (
          <form onSubmit={handleSubmit} className="join-form">

            <input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <select name="group" value={formData.group} onChange={handleChange} required>
              <option value="">Select Group</option>
              <option value="BSC">BSC</option>
              <option value="BCOM">BCOM</option>
              <option value="BA">BA</option>
              <option value="BCA">BCA</option>
            </select>

            <select name="college" value={formData.college} onChange={handleChange} required>
              <option value="">Select College</option>
              <option value="CITY COLLEGE">City College</option>
              <option value="VIVEKANANDA COLLEGE">Vivekananda College</option>
              <option value="BJR COLLEGE">BJR College</option>
              <option value="MALKAJIGIRI COLLEGE">Malkajigiri College</option>
              <option value="GOLCONDA COLLEGE">Golconda College</option>
              <option value="HUSSAINI ALAM COLLEGE">Hussaini Alam College</option>
              <option value="BEGUMPET COLLEGE">Begumpet College</option>
               
            </select>

            <button type="submit">Mark Attendance</button>
          </form>
        )}

      </div>
    </div>
  );
};

export default JoinClass;

 