import { getCartById, updateCart } from "../services/ordersServices.js";

export const getCartByIdController = async (req, res) => {
  try {
    const data = await getCartById(req, res);
    if(!data) {
      return res.status(404).json({
        message: "not found",
      });
    }
    return res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const updateCartController = async (req, res) => {
  try {
    const resp = await updateCart(req, res);
    return;
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};
