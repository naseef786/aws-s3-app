import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
 
 {
    imageName: String,
    imageUrl: String,
    },

  
  { timestamps: true }
);

export default mongoose.model("files", fileSchema);