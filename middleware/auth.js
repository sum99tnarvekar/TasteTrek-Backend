import jwt from "jsonwebtoken";

export const authMiddleware = async (req , res , next) => {
    const { token } = req.headers;
    if(!token) return res.status(400).json({ error: "Authentication Required" });
    try {
        const tokenDecode = jwt.verify(token ,  process.env.JWT_SECRET);
        req.body.userId = tokenDecode;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Somthing went wrong "})
    }
}