import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import API from "../services/api";
import { Link } from "react-router-dom";
function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/teachers/register", form);
      alert("Registration successful");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Teacher Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button>Create Account</button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to={`/`}>login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
