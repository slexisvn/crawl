import mongoose from "mongoose";
import { v1 } from "uuid";

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v1,
  },
  login: {
    type: String,
  },
  repo: {
    type: String,
  },
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  email: {
    type: String,
  },
  profileLink: {
    type: String,
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
