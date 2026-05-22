import { Router } from "express";
import { userController } from "./user.controllers";



const router = Router();

router.post('/signup', userController.createUser);

export const userRoute = router;