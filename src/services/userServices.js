import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import crypto from "crypto";
import { Buffer } from "node:buffer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Users } from "../models/usersModel.js";
import { Role } from "../models/roleModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = parseInt(process.env.SALT);

const KEY = process.env.RANDOMBYTES;
const SECRET_HEX = process.env.AES_SECRET_HEX;

const secretKeyBuffer = KEY;
const secretKey = secretKeyBuffer.toString(SECRET_HEX);

const encrypt = (password, message, callback) => {
  try {
    const encryPassword = CryptoJS.AES.encrypt(password, message).toString();
    callback(null, encryPassword);
  } catch (error) {
    callback(error);
  }
};

const decrypted = (password, message, callback) => {
  try {
    const originalMessage = CryptoJS.AES.decrypt(password, message).toString(
      CryptoJS.enc.Utf8
    );

    callback(null, originalMessage);
  } catch (error) {
    callback(error);
  }
};

export const getUsers = async (req, res) => {
  try {
    // const data = await Users.find({ is_active: true })
    // // .select({
    // //   _id: true,
    // //   email: true,
    // //   role_id: true,
    // //   phone_number: true,
    // // })
    // // .populate({
    // //   path: "role_id",
    // // })
    // // .sort({ create_date: -1 })
    // .limit(10);

    const data = await Users.aggregate([
      {
        $match: {
          is_active: true,
        },
      },
      {
        $lookup: {
          from: "roles", // ชื่อคอลเลกชัน roles
          localField: "role_id", // ฟิลด์ role_id ใน users
          foreignField: "role_id", // ฟิลด์ role_id ใน roles
          as: "role_info", // ชื่อของฟิลด์ที่จะเพิ่มในผลลัพธ์
        },
      },
      {
        $unwind: "$role_info", // แยกผลลัพธ์ของ role_info ออกเป็นเอกสารเดี่ยว
      },
      {
        $project: {
          _id: true,
          email: true,
          phone_number: true,
          role_id: true,
          role_name: "$role_info.role_name", // เพิ่มฟิลด์ role_name จาก role_info
          create_date: true, // ต้องมี create_date เพื่อใช้ในขั้นตอนการ sort
        },
      },
      {
        $sort: {
          create_date: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    const count = await Users.countDocuments({
      is_active: true,
    }).limit(10);

    return { data, count };
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching users");
  }
};

export const gerRoles = async (req, res) => {
  try {
    const data = await Role.find({
      is_active: true,
    }).select({
      role_id: true,
      role_name: true,
    });
    const count = await Role.countDocuments({
      is_active: true,
    });

    return { data, count };
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async (req, res) => {
  try {
    const tokenUser = req.user;
    const { id } = req.params;

    if (id !== tokenUser.id && tokenUser.role_id !== 1) {
      res.status(403).send("You don't have permission to access this user");
    } else {
      const data = await Users.findOne({ _id: id })
        .select({
          _id: true,
          email: true,
          phone_number: true,
        })
        .populate({
          path: "orders",
          populate: {
            path: "products.product",
            select: "name",
          },
        })
        .exec();

      res.status(200).json({
        data,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, phone_number } = req.headers;

    const timeStamp = {
      is_active: true,
      create_date: new Date(),
    };
    let result = {};

    if (email && phone_number && password) {
      const validateUser = await Users.findOne({
        $or: [{ email: email }, { phone_number: phone_number }],
        is_active: true,
      });

      if (validateUser) {
        return res
          .status(400)
          .json({ message: "E-mail or phone number is already." });
      } else {
        if (password) {
          encrypt(password, secretKey, async (err, encryPassword) => {
            if (err) {
              console.error(err);
            } else {
              result = new Users({
                email: email,
                phone_number: phone_number,
                password: encryPassword,
                ...timeStamp,
              });

              let newUser = await result.save();

              if (!newUser) {
                return res.status(404).json({ message: "Create user failed." });
              } else {
                return res.status(200).json({
                  message: "Create user successed",
                });
              }

              // decrypted(encryPassword, secretKey, (err, originalMessage) => {
              //   if (err) {
              //     console.error(err);
              //   } else {
              //     console.log(originalMessage === password);
              //   }
              // });
            }
          });

          // bcrypt.genSalt(saltRounds, (err, salt) => {
          //   if (err) {
          //     return;
          //   }
          //   bcrypt.hash(password, salt, async (err, hash) => {
          //     if (err) {
          //       return;
          //     }
          //     result = new Users({
          //       email: email,
          //       phone_number: phone_number,
          //       password: hash,
          //       ...timeStamp,
          //     });
          //     let newUser = await result.save();

          //     if (!newUser) {
          //       return res.status(404).json({ message: "Create user failed." });
          //     } else {
          //       return res
          //         .status(200)
          //         .json({ message: "Create user successed." });
          //     }
          //   });
          // });
        }
      }
    } else {
      return res.status(400).json({
        message: "Please enter your email, phone number and password.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const tokenUser = req.user;
    const { id } = req.params;
    const { role_id } = req.headers;

    if (id !== tokenUser.id && tokenUser.role_id !== 1) {
      res.status(403).send("You don't have permission to access this user");
    } else {
      const data = await Users.updateOne(
        { _id: id },
        { $set: { role_id: role_id } }
      );

      res.status(200).json({
        message: "This user not found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const tokenUser = req.user;
    const { id } = req.params;

    if (id !== tokenUser.id && tokenUser.role_id !== 1) {
      res.status(403).send("You don't have permission to access this user");
    } else {
      const data = await Users.updateOne(
        { _id: id, is_active: true },
        { $set: { is_active: false } }
      );

      res.status(200).json({
        message: "Deleted success",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "This user not found",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, phone_number } = req.headers;

    if ((!email || !phone_number) && !password) {
      res.error.json({
        message: "Username or password required",
      });
      // return res.status(400).json({
      //   message: "Username or password required",
      // });
    }

    let user = await Users.findOne({
      $or: [{ email: email }, { phone_number: phone_number }],
      is_active: true,
    }).select({
      _id: true,
      // email: true,
      password: true,
      role_id: true,
      // is_active: true,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    if (
      user._id &&
      // && user.email
      user.password
      // && user.is_active
    ) {
      decrypted(user.password, secretKey, (err, originalMessage) => {
        if (err) {
          console.error(err);
        } else {
          const isMatch = originalMessage === password;
          if (!isMatch) {
            return res.status(400).json({
              message: "Invalid username or password",
            });
          }
          const token = jwt.sign(
            {
              id: user._id,
              // email: user.email,
              role_id: user.role_id,
            },
            JWT_SECRET,
            { expiresIn: 60 * 60 * 24 * 7 }
          );

          res.cookie("token", token, {
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            httpOnly: false,
            sameSite: "none",
          });

          res.status(200).json({
            message: "Login Successful",
            id: user._id,
          });
        }
      });

      // const isMatch = decrypted(secretKey, password);
      // console.log(isMatch);
      // const isMatch = await bcrypt.compare(password, user.password);
      // if (!isMatch) {
      //   return res.status(400).json({
      //     message: "Invalid username or password",
      //   });
      // }
      // const token = jwt.sign(
      //   {
      //     id: user._id,
      //     email: user.email,
      //     role_id: user.role_id,
      //   },
      //   JWT_SECRET,
      //   { expiresIn: 60 * 60 * 24 * 7 }
      // );
      // return res.status(200).json({
      //   message: "Login Successful",
      //   token,
      // });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
