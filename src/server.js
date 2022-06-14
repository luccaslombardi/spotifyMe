import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(routes);

app.listen(port, () =>
  console.log(`Server is running at ${port}, now go to /login`)
);
