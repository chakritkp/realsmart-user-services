import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  phone_number: { type: String, require: true },
  password: { type: String, require: true },
  role_id: { type: Number, default: 3 },
  is_active: { type: Boolean, default: true },
  create_date: {
    type: Date,
    default: Date.now,
  },
});

export const Users = mongoose.model("Users", usersSchema, "users");
