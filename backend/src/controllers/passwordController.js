import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";

// STEP 1: Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account with this email" });

    await PasswordResetToken.deleteMany({ userId: user._id });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 1000 * 60 * 10,
    });

    return res.json({
      message: "✅ Reset token generated",
      resetToken,
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// STEP 2: Perform reset
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!resetRecord)
      return res.status(400).json({ message: "Invalid or expired token" });

    const user = await User.findById(resetRecord.userId);
    user.password = password;
    await user.save();

    await resetRecord.deleteOne();

    return res.json({ message: "✅ Password reset successful" });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
