import bcrypt from "bcryptjs";
import config from "../../config";
import { pool } from "../../db";

import jwt, { type JwtPayload } from "jsonwebtoken";
import { create } from "node:domain";

const loginUserDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  const jwtToken =  jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });

  return {
    token: jwtToken,
    user: jwtpayload,
  };
};


export const authService = {
  loginUserDB,
};