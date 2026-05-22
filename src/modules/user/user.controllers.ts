import type { Request, Response } from "express";
import { userService } from "./user.service";


const createUser = async(req: Request, res: Response) => {

try { 
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result
    });
}
catch (error) {
    res.status(500).json({
        success: false,
        message: "Failed to create user",
    });
}

}

export const userController = {
    createUser
}; 