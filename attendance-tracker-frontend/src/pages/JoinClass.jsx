import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./JoinClass.css";

const JoinClass = () => {
  const { classCode } = useParams();

  // 🔹 Load saved student profile (if exists)
  const savedProfile = JSON.parse(
    localStorage.getItem("studentProfile")
  );

  const [formData, setFormData] = useState({
    fullName: savedProfile?.fullName || "",
    email: savedProfile?.email || "",
    group: savedProfile?.group || "",
    college: savedProfile?.college || ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [classInfo, setClassInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  /* ================= FETCH CLASS INFO ================= */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/classes/by-code/${classCode}`)
      .then((res) => setClassInfo(res.data))
      .catch(() => setExpired(true));
  }, [classCode]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (!classInfo?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(classInfo.expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [classInfo]);

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "email"
          ? value.toLowerCase()
          : value.toUpperCase()
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (expired) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        { ...formData, classCode }
      );

      // ✅ SAVE / UPDATE STUDENT PROFILE
      localStorage.setItem(
        "studentProfile",
        JSON.stringify(formData)
      );

      setMessage(res.data.message);
      setError("");

      if (res.data.meetLink) {
        window.open(res.data.meetLink, "_blank");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <h2>{classInfo?.className}</h2>
        <p><b>Subject:</b> {classInfo?.subject}</p>

        {/* ⏳ COUNTDOWN */}
        {!expired ? (
          <p className="countdown">⏳ Time left: {timeLeft}</p>
        ) : (
          <p className="expired">❌ Class link expired</p>
        )}

        {/* ✅ UX NOTE */}
        {savedProfile && !expired && (
          <p className="prefill-note">
            ✅ We’ve pre-filled your details. Please review and update if required.
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

            <input
              name="group"
              placeholder="Group"
              value={formData.group}
              onChange={handleChange}
              required
            />

            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
            >
              <option value="">Select College</option>
              <option value="CITY COLLEGE">City College</option>
              <option value="VIVEKANANDA COLLEGE">Vivekananda College</option>
              <option value="BJR COLLEGE">BJR College</option>
                <option value="MALKAJIGIRI COLLEGE">Malkajigiri College</option>
                <option value="GOLCONDA COLLEGE">Golconda College</option>
                <option value="HUSSAINI ALAM COLLEGE">Hussaini Alam College</option>
                <option value="BEGUMPET COLLEGE">Begumpet College</option>
              <option value="OTHER">Other</option>
            </select>

            <button type="submit">Mark Attendance</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinClass;