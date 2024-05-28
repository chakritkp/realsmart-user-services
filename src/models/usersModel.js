import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  email: String,
  phone_number: String,
  password: String,
  role_id: Number,
  is_active: Boolean,
  create_date: {
    type: Date,
    default: Date.now,
  },
});

export const Users = mongoose.model("Users", usersSchema, "users_table");
