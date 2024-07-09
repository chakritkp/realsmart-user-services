import { Products } from "../models/products.js";

export const getProducts = async (req, res) => {
  try {
    let { search, page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const query = {
      $or: [
        { name: { $regex: new RegExp(search, "i") } },
        { code: { $regex: new RegExp(search, "i") } },
      ],
      is_active: true,
    };

    const skip = (page - 1) * limit;

    const data = await Products.find(query).skip(skip).limit(limit || 10);

    // const data = await Products.find()
    //   // .skip()
    //   // .limit(10);

    const count = await Products.countDocuments();
    const totalPages = Math.ceil(count / limit);
    return { data, page, totalPages, count };
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products");
  }
};
