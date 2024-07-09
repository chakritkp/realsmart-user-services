import { getProducts } from "../services/productsServices.js";

export const getProductsController = async (req, res) => {
  try {
    const { data, page, totalPages, count } = await getProducts(req, res);
    res.status(200).json({
      data: data,
      meta: {
        page,
        totalPages,
        count,
      },
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};
