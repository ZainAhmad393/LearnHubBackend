const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const courses = [
  {
    title: "Modern React & Redux",
    category: "Web Dev",
    instructor: "Anil Sidhu",
    duration: "4 hrs",
    rating: 4.7,
    image: "https://placehold.co/300x160/38a8a4/ffffff?text=React+UI",
    playlistUrl: "PL8p2I9GklV47BCAjiCtuV_liN9IwAl8pM"
  },
  {
    title: "Mastering Python for Data Science",
    category: "Data Science", 
    instructor: "Apna College",
    duration: "20 hrs",
    rating: 4.9,
    image: "https://placehold.co/300x160/546e7a/ffffff?text=Python+Data",
    playlistUrl: "PLGjplNEQ1it8-0CmoljS5yeV-GlKSUEt0"
  },
  {
    title: "Full Stack Node.js & Express",
    category: "Web Dev",
    instructor: "Apna College", 
    duration: "11 hrs",
    rating: 4.6,
    image: "https://placehold.co/300x160/e0f7fa/000000?text=Node.js+Backend",
    playlistUrl: "PL8p2I9GklV456iofeMKReMTvWLr7Ki9At"
  },
  {
    title: "Advance CSS",
    category: "Design",
    instructor: "Yahu Baba",
    duration: "2 hrs", 
    rating: 4.6,
    image: "https://placehold.co/300x160/e0f7fa/000000?text=CSS+Design",
    playlistUrl: "PL0b6OzIxLPbzDsI5YXUa01QzxOWyqmrWw"
  },
  {
    title: "Master Marketing",
    category: "Marketing",
    instructor: "Marketing Fundas",
    duration: "18 hrs",
    rating: 4.6,
    image: "https://placehold.co/300x160/e0f7fa/000000?text=Marketing",
    playlistUrl: "PLXwTOG3-tRwiJmAyVJ47SVvv-dUIy2S0I"
  }
];

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing courses
    await Course.deleteMany({});
    console.log('✅ Existing courses deleted');

    // Insert new courses
    await Course.insertMany(courses);
    console.log('✅ Courses seeded successfully');

    // Display inserted courses
    const insertedCourses = await Course.find();
    console.log(`📚 Total courses in database: ${insertedCourses.length}`);
    
    insertedCourses.forEach(course => {
      console.log(`- ${course.title} (${course.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedCourses();