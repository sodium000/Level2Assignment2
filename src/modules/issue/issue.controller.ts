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

        res.status(500).json({
            success: false,
            message: "Failed to create issue",
            error: (error as any).message || "Unknown error"
        });
    }
}

const getAll = async (req: Request, res: Response) => {
    try {
        const issues = await issueService.getAllIssues(req.query);
        res.status(200).json({
            success: true,
            data: issues
        });
    }
    catch (error) {
        console.error("Get all issues error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve issues",
            error: (error as any).message || "Unknown error"
        });
    }
}



const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const issue = await issueService.getSingleIssueFromDB(id as string);

        if (!issue) {
            res.status(404).json({
                success: false,
                message: "Issue not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: issue
        });
    }
    catch (error) {
        console.error("Get single issue error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve issue",
            error: (error as any).message || "Unknown error"
        });
    }
}

export const issueController = {
    issuecreate,
    getAll,
    getSingleIssue
};