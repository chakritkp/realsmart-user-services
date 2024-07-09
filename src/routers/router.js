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

import {
  getProductsController
} from "../controller/productsController.js";

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
router.patch("/users/:id", authPermissions, updateUserController);
router.delete("/users/:id", authPermissions, deleteUserController);
router.post("/user-register-services", registerUserController);
router.post("/user-login-services", loginUserController);
router.post("/user-logout-services", authPermissions, logoutController);

router.get("/roles", authPermissions, gerRolesController);

router.get("/products", authPermissions, getProductsController);

router.post("/upload", (req, res) => {
  try {
    const {} = req.body;
    res.json(req.file);
  } catch (error) {}
});

export default router;
