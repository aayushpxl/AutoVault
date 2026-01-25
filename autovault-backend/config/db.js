require('dotenv').config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use test DB URI if running tests
    const uri = process.env.NODE_ENV === "test"
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables.");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB connected to: ${uri}`);
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
