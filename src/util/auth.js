import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
export const authPermissions = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) {
      return res.status(401).json({ message: "No cookies provided" });
    }

    const [name, value] = cookies.split("=");
    const token = value;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
      } else {
        next();
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).send("Token Invalid!");
  }
};
