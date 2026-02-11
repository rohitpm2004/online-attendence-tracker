import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
 
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";


const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#14b8a6", "#eab308"];

function BranchDashboard() {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get(`/branches/${branchId}/analytics`);

        // 🛡 safety defaults
        setData({
  branchName: res.data.branchName || "Branch",
  totalClasses: res.data.totalClasses || 0,
  totalStudents: res.data.totalStudents || 0,
  totalJoinings: res.data.totalJoinings || 0,
  classes: res.data.classes || [],
  collegeStats: res.data.collegeStats || [],
  topCollege: res.data.topCollege || null,
  mostActiveClass: res.data.mostActiveClass || null,
  dailyTrend: res.data.dailyTrend || []
});


      } catch (err) {
        console.log(err);
        alert("Failed to load branch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [branchId]);

  /* ================= STATES ================= */

  if (loading) return <div className="page"><h2>Loading...</h2></div>;
  if (!data) return <div className="page"><h2>No data found</h2></div>;

  const hasCollegeData = data.collegeStats && data.collegeStats.length > 0;

  /* ================= UI ================= */

  // return (
//     <div className="page">

//       {/* HEADER */}
//       <div className="branch-header">
//         <button onClick={() => navigate(-1)} className="btn">← Back</button>
//         <h2 style={{fontSize:"35px"}}>{data.branchName} Branch Dashboard</h2>
//         <button
//           className="btn btn-view"
//           onClick={() => navigate(`/dashboard/${branchId}`)}
//         >
//           Branch Classes
//         </button>
//       </div>

//       {/* ACTIONS */}
//       {/* <div className="branch-actions">
//         <button
//           className="btn btn-view"
//           onClick={() => navigate(`/dashboard/${branchId}`)}
//         >
//           Branch Classes
//         </button>
//       </div> */}

//       {/* STATS */}
//       <div className="stats-grid">
//         {/* INSIGHTS */}
// <div className="insights-grid">

//   <div className="insight-card highlight">
//     <h4>🏆 Top College</h4>
//     <p>{data.topCollege || "No data"}</p>
//   </div>

//   <div className="insight-card">
//     <h4>🔥 Most Active Class</h4>
//     <p>{data.mostActiveClass || "No activity yet"}</p>
//   </div>

// </div>
// {/* DAILY TREND */}
// <div className="trend-section">
//   <h3>Daily Join Trend</h3>

//   {data.dailyTrend?.length === 0 ? (
//     <p className="no-data">No attendance trend yet</p>
//   ) : (
//     <div className="chart-box">
//       <ResponsiveContainer width="100%" height={320}>
//         <LineChart data={data.dailyTrend}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="joins"
//             stroke="#6366f1"
//             strokeWidth={3}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   )}
// </div>


//         <div className="stat-card">
//           <h3>Total Classes</h3>
//           <p>{data.totalClasses}</p>
//         </div>

//         <div className="stat-card">
//           <h3>Total Students</h3>
//           <p>{data.totalStudents}</p>
//         </div>

//         <div className="stat-card">
//           <h3>Total Joinings</h3>
//           <p>{data.totalJoinings}</p>
//         </div>
//       </div>

//       {/* COLLEGE ANALYTICS */}
//       <div className="college-section">
//         <h3>Students by College</h3>

//         {!hasCollegeData ? (
//           <p className="no-data">No college attendance yet</p>
//         ) : (
//           <div className="chart-box">
//             <ResponsiveContainer width="100%" height={350}>
//               <PieChart>
//                 <Pie
//                   data={data.collegeStats}
//                   dataKey="students"
//                   nameKey="college"
//                   outerRadius={130}
//                   label={({ name, percent }) =>
//                     `${name} ${(percent * 100).toFixed(0)}%`
//                   }
//                 >
//                   {data.collegeStats.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>

//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>

//     </div>
return (
  <div className="page">

  {/* HEADER */}
  <div className="branch-header">
    <button onClick={() => navigate(-1)} className="btn">← Back</button>

    <h2 className="branch-title">
      {data.branchName} Branch Dashboard
    </h2>

    <button
      className="btn"
      onClick={() => navigate(`/dashboard/${branchId}`)}
    >
     main Branch Classes
    </button>
  </div>


  {/* STATS */}
  <div className="stats-grid">
    <div className="stat-card">
      <h3>Total Classes</h3>
      <p>{data.totalClasses}</p>
    </div>

    <div className="stat-card">
      <h3>Total Students</h3>
      <p>{data.totalStudents}</p>
    </div>

    <div className="stat-card">
      <h3>Total Joinings</h3>
      <p>{data.totalJoinings}</p>
    </div>
  </div>


  {/* INSIGHTS */}
  <div className="insights-grid">
    <div className="insight-card">
      <h4>🏆 Top College</h4>
      <p>{data.topCollege || "No data"}</p>
    </div>

    <div className="insight-card">
      <h4>🔥 Most Active Class</h4>
      <p>{data.mostActiveClass || "No activity yet"}</p>
    </div>
  </div>


  {/* CHARTS */}
  <div className="chart-grid">

    {/* LINE CHART */}
    <div className="chart-card">
      <h3>Daily Join Trend</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.dailyTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="joins" stroke="#6366f1" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>


    {/* PIE CHART */}
    <div className="chart-card">
      <h3>Students by College</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.collegeStats}
            dataKey="students"
            nameKey="college"
            outerRadius={110}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.collegeStats.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

    </div>

  </div>

</div>

);

  // );
}

export default BranchDashboard;