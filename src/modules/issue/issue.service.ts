import type { Request, Response } from "express";
import { pool } from "../../db/index";

// Types
interface IssueData {
    title: string;
    description: string;
    type: string;
    status?: string;
}

interface UserInfo {
    id: number;
    name: string;
    role: string;
}

interface FormattedIssue {
    id: number;
    title: string;
    description: string;
    type: string;
    status: string;
    reporter: UserInfo | null;
    created_at: string;
    updated_at: string;
}

interface RawIssue {
    id: number;
    title: string;
    description: string;
    type: string;
    status: string;
    reporter_id: number;
    created_at: string;
    updated_at: string;
}

const fetchUsersByIds = async (userIds: number[]): Promise<Record<number, UserInfo>> => {
    if (userIds.length === 0) return {};

    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(", ");
    const query = `SELECT id, name, role FROM users WHERE id IN (${placeholders})`;
    
    const result = await pool.query(query, userIds);
    
    const usersMap: Record<number, UserInfo> = {};
    result.rows.forEach((user: UserInfo) => {
        usersMap[user.id] = user;
    });
    
    return usersMap;
};

// Helper function to format issue with reporter details
const formatIssueWithReporter = (issue: RawIssue, usersMap: Record<number, UserInfo>): FormattedIssue => {
    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: issue.reporter_id ? (usersMap[issue.reporter_id] || null) : null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
};

const createIssueIntoDB = async (req: Request, res: Response) => {
    try {

        if (!req.body) {
            res.status(400).json({ 
                success: false,
                message: "Request body is required",
                errors: {
                    details: "Ensure Content-Type header is set to application/json and request body is not empty",
                }
            });
            return;
        }

        const { title, description, type, status } = req.body;
        const reporter_id = (req as any).user?.id;

        if (!reporter_id) {
            res.status(401).json({ 
                success: false,
                message: "Unauthorized",
                errors: {
                    details: "User authentication information is missing or invalid",
                }
            });
            return;
        }

        if (!title || !description || !type) {
            res.status(400).json({ 
                success: false,
                message: "Missing required fields",
                errors: {
                    details: "All required fields must be provided: title, description, and type",
                    fields: ["title", "description", "type"],
                }
            });
            return;
        }

        const result = await pool.query(
            "INSERT INTO issues (title, description, type, status, reporter_id, created_at, updated_at) VALUES ($1, $2, $3, COALESCE($4, 'open'), $5, NOW(), NOW()) RETURNING *",
            [title, description, type, status, reporter_id]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error("Error creating issue:", error);
        throw error;
    }
}


const getAllIssues = async (query: Record<string, any>) => {
    try {
        const { sort = "newest", type, status } = query;

        let sqlQuery = `
            SELECT 
                id,
                title,
                description,
                type,
                status,
                reporter_id,
                created_at,
                updated_at
            FROM issues
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramCount = 1;

        if (type) {
            sqlQuery += ` AND type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        if (status) {
            sqlQuery += ` AND status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (sort === "oldest") {
            sqlQuery += ` ORDER BY created_at ASC`;
        } else {
            sqlQuery += ` ORDER BY created_at DESC`;
        }

        const result = await pool.query(sqlQuery, params);
        const issues: RawIssue[] = result.rows;

        const reporterIds = Array.from(
            new Set(
                issues
                    .map((issue: RawIssue) => issue.reporter_id)
                    .filter((id: number | null) => id !== null && id !== undefined)
            )
        ) as number[];

        const usersMap = await fetchUsersByIds(reporterIds);

        return issues.map((issue: RawIssue) => formatIssueWithReporter(issue, usersMap));
    } catch (error) {
        console.error("Error fetching all issues:", error);
        throw error;
    }
};


const getSingleIssueFromDB = async (id: number): Promise<FormattedIssue | null> => {
    try {
        const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const issue: RawIssue = result.rows[0];

        const usersMap = issue.reporter_id ? await fetchUsersByIds([issue.reporter_id]) : {};

        return formatIssueWithReporter(issue, usersMap);
    } catch (error) {
        console.error("Error fetching single issue:", error);
        throw error;
    }
};

const getIssueByIdFromDB = async (id: number): Promise<RawIssue | null> => {
    try {
        const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching issue by ID:", error);
        throw error;
    }
};

const updateIssueInDB = async (
    id: number,
    payload: { title?: string; description?: string; type?: string }
): Promise<FormattedIssue | null> => {
    try {
        const fields: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (!payload.title && !payload.description && !payload.type) {
            throw new Error("At least one field (title, description, or type) is required");
        }

        if (payload.title !== undefined) {
            if (!payload.title.trim()) {
                throw new Error("Title cannot be empty");
            }
            fields.push(`title = $${paramCount}`);
            params.push(payload.title);
            paramCount++;
        }

        if (payload.description !== undefined) {
            if (!payload.description.trim()) {
                throw new Error("Description cannot be empty");
            }
            fields.push(`description = $${paramCount}`);
            params.push(payload.description);
            paramCount++;
        }

        if (payload.type !== undefined) {
            if (!payload.type.trim()) {
                throw new Error("Type cannot be empty");
            }
            fields.push(`type = $${paramCount}`);
            params.push(payload.type);
            paramCount++;
        }

        fields.push(`updated_at = NOW()`);

        const sqlQuery = `UPDATE issues SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await pool.query(sqlQuery, params);
        
        if (result.rows.length === 0) {
            return null;
        }

        const issue: RawIssue = result.rows[0];

        // Fetch reporter details
        const usersMap = issue.reporter_id ? await fetchUsersByIds([issue.reporter_id]) : {};

        return formatIssueWithReporter(issue, usersMap);
    } catch (error) {
        console.error("Error updating issue:", error);
        throw error;
    }
};

const deleteIssueFromDB = async (id: number): Promise<boolean> => {
    try {
        const result = await pool.query("DELETE FROM issues WHERE id = $1", [id]);
        
        // Returns true if a row was deleted, false if no row was found
        return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
        console.error("Error deleting issue:", error);
        throw error;
    }
};

export const issueService = {
    createIssueIntoDB,
    getAllIssues,
    getSingleIssueFromDB,
    getIssueByIdFromDB,
    updateIssueInDB,
    deleteIssueFromDB,
};