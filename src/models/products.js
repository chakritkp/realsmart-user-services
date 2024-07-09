import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
  img: { type: [String] },
  name: { type: String },
  code: { type: String },
  price: { type: Number },
});

export const Products = mongoose.model("Products", productsSchema, "products");

