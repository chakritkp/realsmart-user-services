import { Orders } from "../models/orderModel.js";
import { Products } from "../models/products.js";
import { Users } from "../models/usersModel.js";

export const getCartById = async (req, res) => {
  try {
    const tokenUser = req.user;
    const { id } = req.params;

    if (id !== tokenUser.id) {
      return res
        .status(403)
        .send("You don't have permission to access this user");
    }

    const data = await Orders.findOne({ user: id })
      .where({ status: "cart" })
      .populate("user", "email phone_number")
      .populate("products._id", "img name code price");

    return data;
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching cart");
  }
};

export const updateOrders = async (req, res) => {
  try {
    const tokenUser = req.user;
    const { id } = req.params;
    const { products } = req.body;

    //เช็ค token ที่เข้ามาว่าตรงกับ id ที่มาจาก params ไหม
    if (id !== tokenUser.id) {
      return res.status(403).json({
        message: "You don't have permission to access this user",
      });
    }

    //เอา id ที่ได้มาเช็คใน database ว่า user นี้มีอยู่จริงไหม ถ้ามีจริงก็ดึง id ของ user นี้ออกมาเลย
    const userId = await Users.findById(id).select({ _id: true }).exec();

    //เช็คว่ามี user จริงไหม ถ้าไม่มี return ออกไปเลย
    if (!userId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //เช็คว่า user นี้มี order ที่อยู่ในสถานะ cart ใน database ไหม
    let order = await Orders.findOne({ user: userId, status: "cart" });

    //ในกรณีที่ user นี้ไม่มี order ที่อยู่ในสถานะ cart จะสร้าง order ใหม่ที่อยู่ในสถานะ cart
    if (!order) {
      //สร้างตัวแปรเพื่อเตรียม สิ่งที่จะเข้าในสร้างใน colletion orders โดนใน code นี้จะประกอบให้เก็บค่าเริ่มต้นเป็น user id
      //และ สถานะเรื่มต้นเป็น cart
      let newOrder = new Orders({
        user: userId,
        status: "cart",
      });

      //เชฟข้อมูลเข้า database colletion orders
      order = await newOrder.save();

      //เช็คว่า order ถูกสร้างสำเร็จไหม
      if (!order) {
        return res.status(400).json({
          message: "Create orders failed",
        });
      }

      //เช็คสินค้าที่เข้ามาว่ามีไหม โดนต้องมากกว่า 0 ชิ้น ถ้าไม่ก็ return ออก (ในกรณีของฟังก์ชั่นนี้สามารถเก็บสินค้าได้หลายชิ้นใน 1 ทรานเซ็กชั่น)
      if (!products || products.length === 0) {
        return res.status(403).json({
          message: "Please select a product",
        });
      }

      //นำ products มา map, for loop, forEach เพื่อเชฟสิ้นค่าเข้าไปใน order ทีละชิ้น
      products?.map(async (product) => {
        //เช็คว่าสินค้านี้มีอยู่จริงไหมโดยการนำ product id เข้าไปเช็ค และถ้ามีให้ดึก id และ จำนวนออกมา
        const findProduct = await Products.findById(product._id)
          .select({ _id: true, quantity: true })
          .exec();

        //เช็คว่ามีสินค้าอยู่จริงไหมถ้าไม่ return ออก และถ้ามีแต่จำนวนสินค้าที่ส่งเข้ามามากกว่าสินค้าที่มีอยู่ หรือ สินค้าที่มีอยู่น้อยกว่า 1 ชิ้น return ออกเช่นกัน
        if (!findProduct) {
          return res.status(404).json({ message: "Product not found" });
        } else if (
          findProduct.quantity < product.quantity ||
          product.quantity < 1
        ) {
          return res.status(400).json({ message: "Insufficient quantity" });
        }

        //ถ้าครบทุกเงื่อนไขให้ update order ด้วย order id นั้น และอัพเดทด้วย $addToSet เพื่อเพิ่มสิ้นค้าเข้าไปใน Array
        await Orders.updateOne(
          { _id: order._id },
          {
            $addToSet: {
              products: product,
            },
          }
        );
      });
    }

    //** ในส่วนตรงนี้คือในกรณีที่ user มี order ที่อยู่ในสถานะ cart อยู่แล้ว */

    //เช็คสินค้าที่เข้ามาว่ามีไหม โดนต้องมากกว่า 0 ชิ้น ถ้าไม่ก็ return ออก (ในกรณีของฟังก์ชั่นนี้สามารถเก็บสินค้าได้หลายชิ้นใน 1 ทรานเซ็กชั่น)
    if (!products || products.length === 0) {
      res.status(403).json({
        message: "Please select a product",
      });
      return;
    }

    //นำ products มา map, for loop, forEach เพื่อเชฟสิ้นค่าเข้าไปใน order ทีละชิ้น
    products?.map(async (product) => {
      const findProduct = await Products.findById(product._id)
        .select({ _id: true, quantity: true })
        .exec();

      //เช็คว่ามีสินค้าอยู่จริงไหมถ้าไม่ return ออก และถ้ามีแต่จำนวนสินค้าที่ส่งเข้ามามากกว่าสินค้าที่มีอยู่ หรือ สินค้าที่มีอยู่น้อยกว่า 1 ชิ้น return ออกเช่นกัน
      if (!findProduct) {
        return res.status(404).json({ message: "Product not found" });
      } else if (
        findProduct.quantity < product.quantity ||
        product.quantity < 1
      ) {
        return res.status(400).json({ message: "Insufficient quantity" });
      }

      //เช็คว่าสินค้าที่ถูกเพิ่มเข้ามาใหม่มีอยู่ใน order อยู่แล้วไหม
      const findProductOnOrder = order.products.find(
        (p) => p._id.toString() === product._id
      );

      //ถ้ามีอยู่แล้วเราจะใช้ $set เพื่ออัพเดทค่าที่มีอยู่แล้วเช่น จำนวนของสินค้า แต่ถ้าสินค้าที่เข้ามาใหม่ไม่ได้มีอยู่แล้วใช้ $addToSet เพื่อเพิ่มเข้าไปใน Array จบ
      if (findProductOnOrder) {
        await Orders.updateOne(
          { _id: order._id },
          {
            $set: {
              products: product,
            },
          }
        );
      } else {
        await Orders.updateOne(
          { _id: order._id },
          {
            $addToSet: {
              products: product,
            },
          }
        );
      }
      return res.status(200).json({
        message: "Order updated successfully",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products");
  }
};
