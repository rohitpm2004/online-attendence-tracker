import Branch from "../models/Branch.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";



/* CREATE BRANCH */
export const createBranch = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Branch name required" });
    }

    const exists = await Branch.findOne({
      name,
      teacher: req.user._id
    });

    if (exists) {
      return res.status(400).json({ message: "Branch already exists" });
    }

    const branch = await Branch.create({
      name,
      teacher: req.user._id
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET MY BRANCHES */
export const getMyBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ teacher: req.user._id })
      .sort({ createdAt: -1 });

    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE BRANCH (CASCADE DELETE) */
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find branch
    const branch = await Branch.findById(id);

    if (!branch)
      return res.status(404).json({ message: "Branch not found" });

    // 2️⃣ Ownership check
    if (branch.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    // 3️⃣ Find all classes in branch
    const classes = await Class.find({ branch: id });

    const classIds = classes.map(c => c._id);

    // 4️⃣ Delete attendance of those classes
    await Attendance.deleteMany({ class: { $in: classIds } });

    // 5️⃣ Delete classes
    await Class.deleteMany({ branch: id });

    // 6️⃣ Finally delete branch
    await branch.deleteOne();

    res.json({ message: "Branch and all related data deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) return res.status(404).json({ message: "Branch not found" });

    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
