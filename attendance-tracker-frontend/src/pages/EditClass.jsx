import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    className: "",
    subject: "",
    meetLink: "",
    expiresAt: ""
  });

  useEffect(() => {
    API.get(`/classes/my`)
      .then(res => {
        const cls = res.data.find(c => c._id === id);
        if (cls) {
          setForm({
            className: cls.className,
            subject: cls.subject,
            meetLink: cls.meetLink,
            expiresAt: cls.expiresAt?.slice(0, 16)
          });
        }
      });
  }, [id]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    await API.put(`/classes/update/${id}`, form);
    alert("Class updated successfully");
    navigate("/dashboard");
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
