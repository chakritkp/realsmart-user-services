import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authPermissions = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, verify) => {
      if (err) {
        console.error("Token verification failed:", err);
      } else {
        req.user = verify;
        next();
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).send("Token Invalid!");
  }
};

export default authPermissions;
