import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { issueController } from "./issue.controller";



 const router = Router();


 router.post("/", verifyToken,issueController.issuecreate);


 export const issueRoute = router;