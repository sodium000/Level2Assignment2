import type { Request, Response } from "express";
import { pool } from "../../db/index";




const createIssueIntoDB = async (req: Request, res: Response) => {
    const { title, description, type, status } = req.body;
    const reporter_id = (req as any).user?.id;

    if (!reporter_id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const result = await pool.query(
        "INSERT INTO issues (title, description, type, status, reporter_id, created_at, updated_at) VALUES ($1, $2, $3,COALESCE($4,'open'), $5, NOW(), NOW()) RETURNING *",
        [title, description, type, status, reporter_id]
    );
    return result.rows[0];
}

/**
 * Retrieves all issues from the database with optional sorting and filtering.
 * This service function is structured with clear patterns to help beginner developers
 * learn industry-standard database practices in Node.js/TypeScript.
 * 
 * @param query - The request query parameters containing optional filters (sort, type, status)
 * @returns Array of issues formatted with their respective reporter (user) details.
 */
const getAllIssues = async (query: Record<string, any>) => {
    // 1. EXTRACT & DEFAULT QUERY PARAMETERS
    // We destructure standard parameters from the query object.
    // Specifying a default value ('newest') for sort ensures we always have a valid sort option.
    const { sort = "newest", type, status } = query;

    // 2. DYNAMIC SQL QUERY BUILDING
    // We start with a base query and use the "WHERE 1=1" pattern.
    // "WHERE 1=1" is a standard practice for dynamic queries: it is always true,
    // which allows us to simply append "AND some_condition = ..." without worrying
    // about whether to prefix with "WHERE" or "AND" for subsequent conditions.
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
    const issues = result.rows;

    const usersMap: Record<number, { id: number; name: string; role: string }> = {};

    if (issues.length > 0) {
        const reporterIds = Array.from(
            new Set(
                issues
                    .map((issue: any) => issue.reporter_id)
                    .filter((id: any) => id !== null && id !== undefined)
            )
        );

        if (reporterIds.length > 0) {
            const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(", ");
            const userQuery = `SELECT id, name, role FROM users WHERE id IN (${placeholders})`;

            const usersResult = await pool.query(userQuery, reporterIds);

            usersResult.rows.forEach((user: any) => {
                usersMap[user.id] = {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                };
            });
        }
    }


    return issues.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        status: row.status,
        reporter: row.reporter_id ? (usersMap[row.reporter_id] || null) : null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }));
};

export const issueService = {
    createIssueIntoDB,
    getAllIssues
};