import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [systemRoles.User, systemRoles.Admin],
      default: systemRoles.User,
      required: true,
    },
    token: {
      type: String,
    },
  },
  { timeseries: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
