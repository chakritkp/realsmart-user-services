import express from "express";
import authPermissions from "../util/auth.js";
import {
  getUsersController,
  gerRolesController,
  getUserController,
  registerUserController,
  updateUserController,
  deleteUserController,
  loginUserController,
  logoutController,
} from "../controller/userController.js";

import { getProductsController } from "../controller/productsController.js";

import {
  getCartByIdController,
  updateCartController,
} from "../controller/ordersController.js";

import multer from "multer";
import path from "path";

const router = express.Router();

/**
 * @swagger
 * /roles:
 *  get:
 *    summary: Returns a list of roles
 *    description: Endpoint to fetch roles from the server
 *    responses:
 *      '200':
 *        description: A successful response with roles data
 */
router.get("/users", authPermissions, getUsersController);
router.get("/users/:id", authPermissions, getUserController);
router.post("/user-register-services", registerUserController);
router.post("/user-login-services", loginUserController);
router.post("/user-logout-services", authPermissions, logoutController);
router.patch("/users/:id", authPermissions, updateUserController);
router.delete("/users/:id", authPermissions, deleteUserController);

router.get("/roles", authPermissions, gerRolesController);

router.get("/products", authPermissions, getProductsController);

router.get("/cart/:id", authPermissions, getCartByIdController);
router.post("/cart/:id", authPermissions, updateCartController);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("/uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("img"), (req, res) => {
  try {
    const {} = req.body;
    res.json(req.file.path);
  } catch (error) {}
});

export default router;
