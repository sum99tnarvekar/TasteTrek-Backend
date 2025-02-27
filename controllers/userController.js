import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const createToken = (id) => {
    return jwt.sign(id, process.env.JWT_SECRET);
}

export const userLogin = async (req , res) => {
    const {email , password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });
    try {
        db.query("SELECT id, email, password FROM user WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ error: "Internal server error" });
            if (result.length === 0) return res.status(400).json({ error: "User not exists with this email" });
            const user = result[0];
            const hashedPassword = user.password;
            const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
            if (!isPasswordMatch) return res.status(400).json({ error: "Invalid email or password" });
            const userToken = createToken(user.id);
            return res.status(200).json({ message: "User loggin successfully",token: userToken });
        });
    } catch (error) {
        console.error("Error in userLogin:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const userSignup = async (req , res) => {
    const { name , email , password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
    if (!validator.isEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    if (!validator.isLength(password, { min: 8 })) return res.status(400).json({ error: "Password must be at least 8 characters long" });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
    if (!/[\W_]/.test(password)) return res.status(400).json({ error: "Password must contain at least one special character" });
    
    try {
        db.query("SELECT email FROM user WHERE email = ?", [email], async (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: "User registration failed" });
            }
            if (result.length > 0) return res.status(400).json({ error: "User already exists with this email" });

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const sqlQuery = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
            const values = [name, email, hashedPassword];
            db.query(sqlQuery, values, (err, results) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ error: "User registration failed" });
                }
                const userId = results.insertId;
                const userToken = createToken(userId);
                return res.status(200).json({ message: "User registered successfully",token: userToken });
            });
        });
    } catch (error) {
        console.error("Error in userSignup:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}