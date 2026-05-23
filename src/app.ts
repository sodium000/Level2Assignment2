import CookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  //res.send("Hello World!");
  res.status(200).json({
    message: "Assignment 2 - DevPulse API",
    author: "Tonmoy",
  });
});


app.use("/api/auth", userRoute);
app.use("/api/auth", userRoute);


export default app;