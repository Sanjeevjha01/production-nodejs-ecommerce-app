import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    // Check if MongoDB URL is provided
    if (!process.env.MONGO_URL) {
      console.log(
        colors.bgRed.white("❌ MongoDB URL not found in environment variables")
      );
      process.exit(1);
    }

    // Connect to MongoDB (no options needed for modern driver versions)
    await mongoose.connect(process.env.MONGO_URL);

    console.log(
      colors.bgGreen.white(`✅ MongoDB connected: ${mongoose.connection.host}`)
    );
  } catch (error) {
    console.log(
      colors.bgRed.white(`❌ MongoDB connection error: ${error.message}`)
    );
    process.exit(1);
  }
};

// Optional: Add connection event listeners for better monitoring
mongoose.connection.on("disconnected", () => {
  console.log(colors.bgYellow.black("⚠️  MongoDB disconnected"));
});

mongoose.connection.on("error", (err) => {
  console.log(
    colors.bgRed.white(`❌ MongoDB connection error: ${err.message}`)
  );
});

export default connectDB;
