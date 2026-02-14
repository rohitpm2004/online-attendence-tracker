import { useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateClass.css";

function CreateClass() {
  const navigate = useNavigate();
  const { branchId } = useParams(); // ⭐ branch comes from URL
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    className: "",
    subject: "",
    meetLink: "",
    expiresAt: "",
  });

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= CREATE CLASS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // prevent multiple clicks
    setLoading(true);

    try {
      // Convert local datetime → UTC ISO
      const utcDate = new Date(form.expiresAt).toISOString();

      const res = await API.post("/classes/create", {
        ...form,
        expiresAt: utcDate,
        branchId, // ⭐ VERY IMPORTANT
      });
      navigate(`/dashboard/${branchId}`);

      alert("Class created successfully");

      // go back to same branch dashboard
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
            placeholder="Class Name (Ex: React Hooks)"
            value={form.className}
            onChange={handleChange}
            required
          />

          <input
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
          />

          <input
            name="meetLink"
            placeholder="Google Meet Link"
            value={form.meetLink}
            onChange={handleChange}
            required
          />

          <label className="expiry-label">Class Expiry Date & Time</label>

          <input
            type="datetime-local"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Class"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateClass;