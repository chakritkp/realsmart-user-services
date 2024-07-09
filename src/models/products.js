import mongoose from "mongoose";

export const productsSchema = new mongoose.Schema({
  img: { type: [String], required: true },
  name: { type: String, required: true },
  code: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

export const Products = mongoose.model("Products", productsSchema, "products");
