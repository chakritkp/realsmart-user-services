import express from "express";
import { authPermissions } from "../util/auth.js";
import {
  getUsers,
  gerRoles,
  loginUser,
  registerUser,
} from "../controller/userController.js";

const router = express.Router();

router.get("/", authPermissions, getUsers);

router.get("/roles", authPermissions, gerRoles);

router.post("/user-register-services", registerUser);

router.post("/user-login-services", loginUser);

export default router;
