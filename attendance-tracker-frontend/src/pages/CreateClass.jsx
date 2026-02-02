import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./CreateClass.css";

function CreateClass() {
  const [form, setForm] = useState({
    className: "",
    subject: "",
    meetLink: "",
    expiresAt: "" // ⏰ NEW
  });

  const [createdClassId, setCreatedClassId] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/classes/create", form);

    alert("Class created successfully");

    navigate(`/class/${res.data._id}`);
  } catch (err) {
    alert(err.response?.data?.message || "Failed to create class");
  }
};



  return (
    <div className="create-page">
      <div className="create-card">
        <h2>Create Class</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="className"
            placeholder="Class Name"
            onChange={handleChange}
            required
          />

          <input
            name="subject"
            placeholder="Subject"
            onChange={handleChange}
            required
          />

          <input
            name="meetLink"
            placeholder="Google Meet Link"
            onChange={handleChange}
            required
          />

          {/* ⏰ EXPIRY DATE & TIME */}
          <label className="expiry-label">Class Expiry Date & Time</label>
          <input
            type="datetime-local"
            name="expiresAt"
            onChange={handleChange}
            required
          />

          <button type="submit">Create Class</button>
        </form>

        {createdClassId && (
          <button
            style={{ marginTop: "10px" }}
            onClick={() => navigate(`/class/${createdClassId}`)}
          >
            View Attendance
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateClass;
