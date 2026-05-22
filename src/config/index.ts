import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connection_string: process.env.CONNECTIONSTRING as string,
  port: parseInt(process.env.PORT || "5000", 10),
//   secret: process.env.JWT_SECRET,
//   refresh_secret: process.env.JWT_REFRESH_SECRET,
};

export default config;