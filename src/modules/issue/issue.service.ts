import type { Request, Response } from "express";
import { pool } from "../../db";



const createIssueIntoDB = async(req:Request,res:Response)=>{ 
    const {  title, description, type, status } = req.body;
    const reporter_id = (req as any).user?.id;

    if (!reporter_id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const result = await pool.query(
        "INSERT INTO issues (title, description, type, status, reporter_id, created_at, updated_at) VALUES ($1, $2, $3,COALESCE($4,'open'), $5, NOW(), NOW()) RETURNING *",
        [ title, description, type, status, reporter_id ]
    );
    return result.rows[0];

}

export const issueService = {
    createIssueIntoDB
};