import express, { json } from "express";
import cors from "cors";
import router from "./routers/router.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerSpec from "./config/swaggerConfig.js";
import swaggerUi from "swagger-ui-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = 3000;
const DB = process.env.DATABASE;
const DBURI = process.env.DATABASENAME;
const DATAAUTH = process.env.DATABASEAUTH;
const mongoURI =
  "mongodb://realsmart:realsmartpass@localhost:27017/chakritkp?authSource=admin";

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

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

app.use("/api-services", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, async () => {
  await mongoose.connect(
    `mongodb+srv://${DBURI}:${DATAAUTH}.yf01htl.mongodb.net/${DB}`
  );
  // await mongoose.connect(mongoURI);
  console.log(`Server is running on port http://localhost:${port}`);
});
