import jwt, { type JwtPayload } from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import config from "../config";
import { pool } from "../db";



export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];


  if (!token) {
    return res.status(401).json({
      message: "No token provided",
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, config.secret as string) as JwtPayload;

    const userData = await pool.query(
      `
     SELECT * FROM users WHERE email=$1   
        `,
      [decoded.email],
    );

    const user = userData.rows[0];

    if (userData.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

