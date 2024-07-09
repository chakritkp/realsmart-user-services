import mongoose from "mongoose";

const ordersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  status: {
    type: String,
    enum: ["cart", "pending", "paid", "success", "shipping", "done"],
    default: "cart",
  },
  is_active: { type: Boolean, default: true },
  create_date: {
    type: Date,
    default: Date.now,
  },
  update_date: {
    type: Date,
    default: Date.now,
  },
});

export const Orders = mongoose.model("Orders", ordersSchema, "orders");
