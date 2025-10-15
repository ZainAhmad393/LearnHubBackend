// controllers/enrollmentController.js - یہ فائل بنائیں
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

// POST /api/enrollments/enroll
export const enrollInCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Validation
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required" });
    }

    // Check if user and course exist
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    // Check if already enrolled
    let existing = await Enrollment.findOne({ userId, courseId });
    if (existing) {
      return res.status(200).json({ 
        message: "Already enrolled", 
        enrollment: existing 
      });
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      progress: 0,
      completedVideos: [],
      lastWatchedVideo: ""
    });

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment
    });
  } catch (error) {
    console.error("Enroll Error:", error);
    res.status(500).json({ message: "Error enrolling user", error: error.message });
  }
};

// GET /api/enrollments/:userId/:courseId
export const getEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId })
      .populate('userId')
      .populate('courseId');

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json(enrollment);
  } catch (error) {
    console.error("Fetch enrollment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/enrollments/progress
export const updateProgress = async (req, res) => {
  try {
    const { userId, courseId, progress, completedVideos, lastWatchedVideo } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required" });
    }

    let enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      // Auto-enroll if not found
      enrollment = await Enrollment.create({
        userId,
        courseId,
        progress: progress || 0,
        completedVideos: completedVideos || [],
        lastWatchedVideo: lastWatchedVideo || ""
      });
    } else {
      // Update existing enrollment
      if (typeof progress === "number") enrollment.progress = progress;
      if (Array.isArray(completedVideos)) enrollment.completedVideos = completedVideos;
      if (lastWatchedVideo) enrollment.lastWatchedVideo = lastWatchedVideo;
      
      await enrollment.save();
    }

    res.status(200).json({ 
      message: "Progress updated", 
      enrollment 
    });
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/enrollments/:userId
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId')
      .sort({ updatedAt: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Fetch enrolled courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};