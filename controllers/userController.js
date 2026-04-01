const { connectDB } = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongodb'); // Added ObjectId requirement here

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const getUser = async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("users").find().toArray();
    return res.send(result);
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { email } = req.body;
    const db = await connectDB();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- STATUS CHECK START ---
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }
    // --- STATUS CHECK END ---

    const token = jwt.sign(
      { id: user?._id, email: user?.email, status: user?.status },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    
    return res.status(200).json({
      success: true,
      data: user || null,
      token: token,
    });

  } catch (err) {
    console.error("Get User Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createNewUser = async (req, res) => {
      try {
    const { fullName, email, password, provider, image } = req.body;

         const db = await connectDB();
        //  Basic Validation
      
    if (!fullName || !email || !provider) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

        if (provider === "Credential") {
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }
}

    // Check existing user
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

        // Hash password
  let hashedPassword = null;
if (provider === "Credential") { 
  hashedPassword = await bcrypt.hash(password, 10);
}

        const userPassword = provider === "Credential" ? hashedPassword : null;

    //  Create user object (Added 'status: active' by default)
    const newUser = {
      fullName,
      email,
      image,
      provider,
      password: userPassword,
      role: "user",
      status: "active", // Added status field here
      createdAt: new Date(),
        };
        
    // Insert into DB
        const result = await db.collection("users").insertOne(newUser);
        console.log("newUser :",result);

     res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: result.insertedId,
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
    
}

const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const db = await connectDB();

     if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent. please check your email!",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15);

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: resetTokenHash, resetPasswordExpires: resetTokenExpires } }
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Travelee" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `<p>Click this link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent",
      url: resetUrl,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const db = await connectDB();

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db.collection("users").findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { password: hashed },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      }
    );

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
     
    const { userId, fullName, image, phone } = req.body;
    
    if (!userId) {
       return res.status(400).json({ success: false, message: "User ID is missing" });
    }

    const db = await connectDB();
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (image) updateData.image = image;
    if (phone) updateData.phone = phone;  

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }  
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      updatedFields: updateData 
    });
  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= NEW CONTROLLERS ADDED =================

// Delete User Controller
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update User Status (Active/Block) Controller
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects 'active' or 'blocked'

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const db = await connectDB();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getUser, 
  getSingleUser, 
  createNewUser, 
  ForgotPassword, 
  ResetPassword, 
  updateProfile,
  deleteUser,        // Exported new function
  updateUserStatus   // Exported new function
};