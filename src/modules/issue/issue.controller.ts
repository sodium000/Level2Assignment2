import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const issuecreate = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req, res);
        res.status(200).json({
            success: true,
            message: "Issue created successfully",
            data: result
        });
    }
    catch (error) {
        // console.error("Issue creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create issue",
            error: (error as any).message || "Unknown error"
        });
    }
}  

export const issueController = {
    issuecreate
};