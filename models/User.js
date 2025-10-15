// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Assuming you use bcryptjs for password hashing

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    
    resetPasswordToken: String, // ✅ Add this
    resetPasswordExpire: Date, // ✅ Add this
    // backend/models/User.js (update)
  
  },
  {
    timestamps: true,
  }
);

// ... (Hash password pre-save middleware) ...
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ... (matchPassword method) ...
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;


