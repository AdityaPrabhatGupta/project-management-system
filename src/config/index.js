import mongoose from "mongoose";

export const initialiseDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected:", mongoose.connection.name);
  } catch (error) {
    console.log("Database connection error:", error);
  }
};