import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import API from "../services/api";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/teachers/login",{ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("teacher", JSON.stringify(res.data.teacher));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Teacher Login</h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <div className="login-footer">
          Not registered?{" "}
          <span onClick={() => navigate("/register")}>
            Register here
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
