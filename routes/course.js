const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses
router.get('/', async (req, res) => {
  try {
    console.log('📦 Fetching all courses from database...');
    const courses = await Course.find();
    console.log(`✅ Found ${courses.length} courses`);
    
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get courses by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const courses = await Course.find({ category });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;