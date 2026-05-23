import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { issueController } from "./issue.controller";



const router = Router();

router.get("/", issueController.getAll);
router.get("/:id", issueController.getSingleIssue);
router.post("/", verifyToken, issueController.issuecreate);

export const issueRoute = router;