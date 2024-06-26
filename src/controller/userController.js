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

// let en = CryptoJS.AES.encrypt("123465", secretKey).toString();
// console.log(en);
// let de = CryptoJS.AES.decrypt(en, secretKey).toString(CryptoJS.enc.Utf8);
// console.log(de);

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
    const data = await Users.find({
      is_active: true,
    })
      .select({
        _id: true,
        email: true,
        phone_number: true,
        role_id: true,
      })
      .sort({ create_date: -1 })
      .limit(10);

    const count = await Users.countDocuments({
      is_active: true,
    }).limit(10);

    res.status(200).json({
      data: data,
      meta: {
        count: count,
      },
    });
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

    res.status(200).json({
      data: data,
      meta: {
        count: count,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, phone_number } = req.headers;
    const timeStamp = {
      is_active: true,
      create_date: new Date(),
      role_id: 2,
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
          encrypt(password, secretKey, (err, encryPassword) => {
            if (err) {
              console.error(err);
            } else {
              result = new Users({
                email: email,
                phone_number: phone_number,
                password: encryPassword,
                ...timeStamp,
              });
              result.save();
              return res
                .status(200)
                .json({ message: "Create user successed." });

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
          //   bcrypt.hash(password, salt, (err, hash) => {
          //     if (err) {
          //       return;
          //     }
          //     result = new Users({
          //       email: email,
          //       phone_number: phone_number,
          //       password: hash,
          //       ...timeStamp,
          //     });
          //     result.save();
          //     return res
          //       .status(200)
          //       .json({ message: "Create user successed." });
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

export const loginUser = async (req, res) => {
  try {
    const { email, password, phone_number } = req.headers;

    if ((!email || !phone_number) && !password) {
      return res.status(400).json({
        message: "Username or password required",
      });
    }

    let user = await Users.findOne({
      $or: [{ email: email }, { phone_number: phone_number }],
      is_active: true,
    }).select({
      _id: true,
      email: true,
      password: true,
      role_id: true,
      is_active: true,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    if (user._id && user.email && user.password && user.is_active) {
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
              email: user.email,
              role_id: user.role_id,
            },
            JWT_SECRET,
            { expiresIn: 60 * 60 * 24 * 7 }
          );
          return res.status(200).json({
            message: "Login Successful",
            token,
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
