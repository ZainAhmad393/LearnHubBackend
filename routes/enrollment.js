const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Course = require("../models/Course");

// ✅ FIXED: Enroll user in course
router.post("/enroll", async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    console.log("Enrollment request:", { userId, courseId });

    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required" });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId, courseId });
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

    // Populate course details before sending response
    await enrollment.populate('courseId');

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment
    });
  } catch (error) {
    console.error("Enroll Error:", error);
    res.status(500).json({ message: "Error enrolling user", error: error.message });
  }
});

// ✅ FIXED: Get all enrollments for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching enrollments for user:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId')
      .sort({ createdAt: -1 });

    console.log("Found enrollments:", enrollments.length);
    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Fetch enrolled courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ FIXED: Update progress
router.put("/progress", async (req, res) => {
  try {
    const { userId, courseId, progress, completedVideos, lastWatchedVideo } = req.body;
    console.log("Progress update:", { userId, courseId, progress });

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
      if (typeof progress === "number") enrollment.progress = progress;
      if (Array.isArray(completedVideos)) enrollment.completedVideos = completedVideos;
      if (lastWatchedVideo) enrollment.lastWatchedVideo = lastWatchedVideo;
      
      await enrollment.save();
    }

    await enrollment.populate('courseId');
    res.status(200).json({ 
      message: "Progress updated", 
      enrollment 
    });
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;