import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const issuecreate = async (req: Request, res: Response) => {
  try {
    const result = await issueService.createIssueIntoDB(req, res);
    res.status(200).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create issue",
      error: (error as any).message || "Unknown error",
    });
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const issues = await issueService.getAllIssues(req.query);
    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error("Get all issues error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve issues",
      error: (error as any).message || "Unknown error",
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await issueService.getSingleIssueFromDB(id as number);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error("Get single issue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve issue",
      error: (error as any).message || "Unknown error",
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = (req as any).user;

    const { title, description, type } = req.body;

    // Check issue exists
    const issue = await issueService.getIssueByIdFromDB(id as number);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    /**
     * Authorization Rules
     *
     * Maintainer:
     *  - Can update any issue
     *
     * Contributor:
     *  - Can update only own issue
     *  - Only if status = open
     */

    if (user.role === "contributor") {
      const isOwner = issue.reporter_id === user.id;

      const isOpen = issue.status === "open";

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own issues",
        });
      }

      if (!isOpen) {
        return res.status(403).json({
          success: false,
          message: "You can only update issues with open status",
        });
      }
    } else if (user.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update issues",
      });
    }

    // Empty payload validation
    if (!title && !description && !type) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    // Update issue
    const updatedIssue = await issueService.updateIssueInDB(id as number, {
      title,
      description,
      type,
    });

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error: any) {
    console.error("Update issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update issue",
      error: error.message || "Unknown error",
    });
  }
};

export const issueController = {
  issuecreate,
  getAll,
  getSingleIssue,
  updateIssue,
};
