// import { useState } from "react";
// import API from "../services/api";
// import { useNavigate } from "react-router-dom";
// import "./CreateClass.css";

// function CreateClass() {
//   const [form, setForm] = useState({
//     className: "",
//     subject: "",
//     meetLink: "",
//     expiresAt: "" // ⏰ NEW
//   });

//   const [createdClassId, setCreatedClassId] = useState(null);
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     // convert local time (IST) → UTC ISO string
//     const utcDate = new Date(form.expiresAt).toISOString();

//     const res = await API.post("/classes/create", {
//       ...form,
//       expiresAt: utcDate
//     });

//     alert("Class created successfully");
//     navigate(`/class/${res.data._id}`);

//   } catch (err) {
//     alert(err.response?.data?.message || "Failed to create class");
//   }
// };




//   return (
//     <div className="create-page">
//       <div className="create-card">
//         <h2>Create Class</h2>

//         <form onSubmit={handleSubmit}>
//           <input
//             name="className"
//             placeholder="Class Name"
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="subject"
//             placeholder="Subject"
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="meetLink"
//             placeholder="Google Meet Link"
//             onChange={handleChange}
//             required
//           />

//           {/* ⏰ EXPIRY DATE & TIME */}
//           <label className="expiry-label">Class Expiry Date & Time</label>
//           <input
//             type="datetime-local"
//             name="expiresAt"
//             onChange={handleChange}
//             required
//           />

//           <button type="submit">Create Class</button>
//         </form>

//         {createdClassId && (
//           <button
//             style={{ marginTop: "10px" }}
//             onClick={() => navigate(`/class/${createdClassId}`)}
//           >
//             View Attendance
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CreateClass;



// import { useState, useEffect } from "react";
// import API from "../services/api";
// import { useNavigate } from "react-router-dom";
// import "./CreateClass.css";

// function CreateClass() {
//   const navigate = useNavigate();

//   const [branches, setBranches] = useState([]);

//   const [form, setForm] = useState({
//     className: "",
//     subject: "",
//     meetLink: "",
//     expiresAt: "",
//     branch: ""   // ✅ NEW
//   });

//   /* ================= LOAD BRANCHES ================= */
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await API.get("/branches");
//         setBranches(res.data);
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchBranches();
//   }, []);

//   /* ================= INPUT HANDLER ================= */
//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   /* ================= CREATE CLASS ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.branch) {
//       alert("Please select a branch first");
//       return;
//     }

//     try {
//       // Convert local datetime → UTC
//       const utcDate = new Date(form.expiresAt).toISOString();

//       const res = await API.post("/classes/create", {
//         ...form,
//         expiresAt: utcDate
//       });

//       alert("Class created successfully");

//       // redirect to class attendance page
//       navigate(`/class/${res.data._id}`);

//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to create class");
//     }
//   };

//   return (
//     <div className="create-page">
//       <div className="create-card">
//         <h2>Create Class</h2>

//         <form onSubmit={handleSubmit}>

//           {/* 🧠 BRANCH SELECTOR */}
//           <label>Select Branch</label>
//           <select
//             name="branch"
//             value={form.branch}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Choose Branch</option>
//             {branches.map((b) => (
//               <option key={b._id} value={b._id}>
//                 {b.name}
//               </option>
//             ))}
//           </select>

//           <input
//             name="className"
//             placeholder="Class Name"
//             value={form.className}
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="subject"
//             placeholder="Subject"
//             value={form.subject}
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="meetLink"
//             placeholder="Google Meet Link"
//             value={form.meetLink}
//             onChange={handleChange}
//             required
//           />

//           <label className="expiry-label">Class Expiry Date & Time</label>
//           <input
//             type="datetime-local"
//             name="expiresAt"
//             value={form.expiresAt}
//             onChange={handleChange}
//             required
//           />

//           <button type="submit">Create Class</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CreateClass;


import { useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateClass.css";

function CreateClass() {
  const navigate = useNavigate();
  const { branchId } = useParams();   // ⭐ branch comes from URL

  const [form, setForm] = useState({
    className: "",
    subject: "",
    meetLink: "",
    expiresAt: ""
  });

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= CREATE CLASS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert local datetime → UTC ISO
      const utcDate = new Date(form.expiresAt).toISOString();

      const res = await API.post("/classes/create", {
        ...form,
        expiresAt: utcDate,
        branchId     // ⭐ VERY IMPORTANT
      });

      alert("Class created successfully");

      // go back to same branch dashboard
      navigate(`/dashboard/${branchId}`);

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

          <label className="expiry-label">
            Class Expiry Date & Time
          </label>

          <input
            type="datetime-local"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
            required
          />

          <button type="submit">Create Class</button>

        </form>
      </div>
    </div>
  );
}

export default CreateClass;
