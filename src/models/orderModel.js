import mongoose from "mongoose";

const ordersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  products: {
    type: [
      {
        _id: {
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
    required: true,
  },

  status: {
    type: String,
    enum: ["cart", "pending", "paid", "success", "shipping", "done"],
    default: "cart",
  },
});

export const Orders = mongoose.model("Orders", ordersSchema, "orders");
