import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single("file");

const uploadFile = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(401).send("error", error);
  }
};
