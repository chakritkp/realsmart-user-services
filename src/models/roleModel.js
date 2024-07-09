import mongoose from "mongoose";

const rolesSchema = new mongoose.Schema({
  role_id: { type: Number },
  role_name: { type: String },
  is_active: { type: Boolean },
});

export const Role = mongoose.model("Role", rolesSchema, "roles");