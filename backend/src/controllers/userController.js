import User from "../models/User.js";
import { logAction } from "../utils/logAction.js";

// ✅ GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.log("GET USERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET one user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.log("GET USER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE user
export const createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ email, password, role });

    await logAction(req.user.email, "CREATE_USER", user.email);

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("CREATE USER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE user (general)
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction(req.user.email, "UPDATE_USER", user.email);

    res.json({ message: "User updated", user });
  } catch (error) {
    console.log("UPDATE USER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ✅ NEW — UPDATE USER ROLE ONLY
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "No role provided" });
    }

    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAction(
      req.user.email,
      "UPDATE_ROLE",
      `${user.email} : ${oldRole} → ${role}`
    );

    return res.json({
      message: "Role updated",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("UPDATE ROLE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction(req.user.email, "DELETE_USER", user.email);

    res.json({ message: "User deleted" });
  } catch (error) {
    console.log("DELETE USER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};