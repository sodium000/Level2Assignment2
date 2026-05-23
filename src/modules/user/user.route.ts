import { Router } from "express";
import { userController } from "./user.controllers";
import { authController } from "../auth/auth.controllers";



const router = Router();

router.post('/signup', userController.createUser);
router.post('/login', authController.loginUser);

export const userRoute = router;