import express, { json } from "express";
import cors from "cors";
import router from "./routers/router.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const DB = process.env.DATABASE;
const DBURI = process.env.DATABASENAME;
const DATAAUTH = process.env.DATABASEAUTH;

app.use(json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://testing-chakrit.web.app",
      "https://testing-chakrit.firebaseapp.com",
    ],
    credentials: true,
  })
);

mongoose.connect(
  `mongodb+srv://${DBURI}:${DATAAUTH}.yf01htl.mongodb.net/${DB}`
);
const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB successfully");
});

app.use("/api-services", router);
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
