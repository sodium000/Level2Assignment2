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
    console.error("Create issue error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create issue",
      errors: {
        details: (error as any).message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error as any).stack : undefined,
      },
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
      errors: {
        details: (error as any).message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error as any).stack : undefined,
      },
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await issueService.getSingleIssueFromDB(Number(id));

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
        errors: {
          details: `Issue with ID ${id} does not exist`,
        },
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
      errors: {
        details: (error as any).message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error as any).stack : undefined,
      },
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = (req as any).user;

    const { title, description, type } = req.body;

   
    const issue = await issueService.getIssueByIdFromDB(Number(id));

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        errors: {
          details: `Issue with ID ${id} does not exist`,
        },
      });
    }

   

    if (user.role === "contributor") {
      const isOwner = issue.reporter_id === user.id;

      const isOpen = issue.status === "open";

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own issues",
          errors: {
            details: `You are not authorized to update this issue. Only the reporter (ID: ${issue.reporter_id}) can update it.`,
          },
        });
      }

      if (!isOpen) {
        return res.status(403).json({
          success: false,
          message: "You can only update issues with open status",
          errors: {
            details: `Issue status is "${issue.status}". Only issues with "open" status can be updated by contributors.`,
          },
        });
      }
    } else if (user.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update issues",
        errors: {
          details: `User role "${user.role}" does not have permission to update issues. Only maintainers and issue reporters can update.`,
        },
      });
    }

    // Empty payload validation
    if (!title && !description && !type) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
        errors: {
          details: "No update fields provided. Please provide at least one of: title, description, or type",
          fields: ["title", "description", "type"],
        },
      });
    }


    const updatedIssue = await issueService.updateIssueInDB(Number(id), {
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
      errors: {
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

  
    if (user.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete issues",
        errors: {
          details: `User role "${user.role}" does not have permission. Only maintainers can delete issues.`,
        },
      });
    }


    const issue = await issueService.getIssueByIdFromDB(Number(id));

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        errors: {
          details: `Issue with ID ${id} does not exist`,
        },
      });
    }


    const deleted = await issueService.deleteIssueFromDB(Number(id));

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete issue",
        errors: {
          details: `Could not delete issue with ID ${id}. The issue may have already been deleted.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete issue",
      errors: {
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

export const issueController = {
  issuecreate,
  getAll,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
