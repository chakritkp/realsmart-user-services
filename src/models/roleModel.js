import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  role_id: Number,
  role_name: String,
  is_active: Boolean,
});

export const Role = mongoose.model('Role', roleSchema, 'roles_table');
