import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [branchId, setBranchId] = useState(null);

  const [form, setForm] = useState({
    className: "",
    subject: "",
    meetLink: "",
    expiresAt: ""
  });

  /* ================= LOAD SINGLE CLASS ================= */
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await API.get(`/classes/single/${id}`);

        const cls = res.data;

        setBranchId(cls.branch?._id); // ⭐ store branch

        setForm({
          className: cls.className,
          subject: cls.subject,
          meetLink: cls.meetLink,
          expiresAt: cls.expiresAt?.slice(0, 16)
        });

      } catch (err) {
        alert("Failed to load class");
      }
    };

    fetchClass();
  }, [id]);

  /* ================= HANDLE INPUT ================= */
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= UPDATE ================= */
  const handleSubmit = async e => {
    e.preventDefault();

    await API.put(`/classes/update/${id}`, form);

    alert("Class updated successfully");

    // ⭐ navigate back to SAME BRANCH
    navigate(branchId ? `/dashboard/${branchId}` : "/branches");
  };

  return (
    <div className="create-page">
      <div className="create-card">
        <h2>Edit Class</h2>

        <form onSubmit={handleSubmit}>
          <input name="className" value={form.className} onChange={handleChange} required />
          <input name="subject" value={form.subject} onChange={handleChange} required />
          <input name="meetLink" value={form.meetLink} onChange={handleChange} required />

          <label>Expiry Date & Time</label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
          />

          <button type="submit">Update Class</button>
        </form>
      </div>
    </div>
  );
}

export default EditClass;
