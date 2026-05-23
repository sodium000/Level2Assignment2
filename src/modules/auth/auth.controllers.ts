import { authService } from "./auth.service";



const loginUser = async (req: any, res: any) => {
try {
    const result = await authService.loginUserDB(req.body);
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: result
    });
} catch (error) {
    res.status(401).json({
        success: false,
        message: "Invalid Credentials!",
    });
}      

}

export const authController = {
    loginUser
};