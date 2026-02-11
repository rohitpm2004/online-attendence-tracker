import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Branches.css";

function Branches() {
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // ================= LOAD BRANCHES =================
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await API.get("/branches/my");
      setBranches(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= CREATE BRANCH =================
  const createBranch = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await API.post("/branches/create", { name: name.trim() });
      setName("");
      fetchBranches();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create branch");
    }
  };

 
const openBranch = (branch) => {
  navigate(`/branch/${branch._id}`);
};

// ================= DELETE BRANCH =================
const deleteBranch = async (branchId) => {
  const confirmDelete = window.confirm(
    "Delete this branch?\nAll classes & attendance will be permanently removed!"
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`/branches/delete/${branchId}`);

    // remove from UI immediately
    setBranches(prev => prev.filter(b => b._id !== branchId));

    alert("Branch deleted successfully");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete branch");
  }
};

  return (
    <div className="branch-page">
      <h2>Your Branches</h2>

      {/* Create Branch */}
      <form className="branch-create" onSubmit={createBranch}>
        <input
          placeholder="Enter branch name (React / JS / Python)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Create Branch</button>
      </form>

      {/* Branch Cards */}
      <div className="branch-grid">
        {branches.length === 0 ? (
          <p>No branches created yet</p>
        ) : (
          branches.map((b) => (
            <div key={b._id} className="branch-card">
            <h3>{b.name}</h3>
                    
            <div className="branch-card-actions">
              <button
                className="open-btn"
                onClick={() => openBranch(b)}
              >
                Open
              </button>
                    
              <button
                className="delete-btn"
                onClick={() => deleteBranch(b._id)}
              >
                Delete
              </button>
            </div>
          </div>

          ))
        )}
      </div>
    </div>
  );
}

export default Branches;