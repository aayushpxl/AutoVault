const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Register User
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if a user with the same username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    // Save user to the database
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



exports.getUsers = async (req, res) => {
  try {

    const users = await User.find();
    return res.status(200).json(
      {
        "success": true,
        "message": "Data fetched",
        "data": users
      }
    )
  } catch (err) {
    console.log(err)
    return res.status(500).json(
      {
        "success": false,
        "message": "Server error"
      }
    )
  }
}

// update
exports.updateOneUser = async (req, res) => {
  const { username, email } = req.body
  const _id = req.params.id
  try {
    const user = await User.updateOne(
      {
        "_id": _id
      },
      {
        $set: {
          "username": username,
          "email": email
        }
      }
    )

    return res.status(200).json(
      {
        "success": true,
        "message": "User data updated"
      }
    )
  } catch (err) {
    return res.status(500).json(
      {
        "success": false,
        "message": "Server Error"
      }
    )
  }
}


// Delete
exports.deleteOneUser = async (req, res) => {
  try {
    const _id = req.params.id
    const user = await User.deleteOne(
      {
        "_id": _id
      }
    )
    console.log(user)
    return res.status(200).json(
      {
        "success": true,
        "message": "User deleted"
      }
    )
  } catch (err) {
    return res.status(500).json(
      {
        "success": false,
        "message": "Server Error"
      }
    )
  }
}

exports.getOneUser = async (req, res) => {
  try {
    console.log("Attempting to find user with ID:", req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        messsage: "User not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
      message: " A user",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// Get total user count
exports.getUserCount = async (req, res) => {
  try {
    console.log("Entered getUserCount controller");

    const count = await User.countDocuments();

    console.log("User count fetched:", count);

    return res.status(200).json({
      success: true,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching user count:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getLoggedInUserProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged in user data fetched successfully",
    data: req.user
  });
};


exports.updateLoggedInUserProfile = async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;

  try {
    const updateFields = {};

    // Check for unique username
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already taken" });
      }
      updateFields.username = username;
    }

    // Check for unique email
    if (email) {
      const existingEmailUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingEmailUser) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      updateFields.email = email;
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }

      const user = await User.findById(req.user._id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Strong password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must be 8-32 characters long and include uppercase, lowercase, and one number",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser.toObject({
        getters: true,
        versionKey: false,
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      }),
    });
  } catch (err) {
    console.error("🔥 Error in updateLoggedInUserProfile:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete logged-in user
exports.deleteLoggedInUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your account has been deleted",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetLink = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "15m",
    });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions = {
      from: `"Gadi Khoj Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Gadi Khoj Password",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #2c3e50;">Gadi Khoj - Password Reset Request</h2>
      <p>Hi there,</p>
      <p>We received a request to reset your password for your Gadi Khoj account.</p>
      <p>Click the button below to reset your password. This link will expire in 15 minutes for your security.</p>
      <a href="${resetUrl}" 
         style="display:inline-block; padding:10px 20px; margin-top:10px; background-color:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
        Reset Password
      </a>
      <p style="margin-top:20px;">If you didn’t request this, you can safely ignore this email.</p>
      <p style="color: #999;">—  Gadi Khoj </p>
    </div>
  `,
    };


    // Use await to send the mail and catch any errors
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: " + info.response);
    res.status(200).json({ success: true, message: "Reset email sent" });

  } catch (err) {
    // Log the actual error to the console for debugging
    console.error("🔥 Error in sendResetLink:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-32 characters long and include uppercase, lowercase, and one number",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });

    res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

