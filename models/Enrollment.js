const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course", 
    required: true 
  },
  progress: { 
    type: Number, 
    default: 0 
  },
  completedVideos: [{ 
    type: String 
  }],
  lastWatchedVideo: { 
    type: String, 
    default: "" 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);