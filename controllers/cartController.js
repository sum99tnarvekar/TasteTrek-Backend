import db from "../config/db.js";


export const addToCart = async (req , res) => {
    const userId = req.body.userId;
    db.query('SELECT cartData FROM user WHERE id = ?', [userId] , async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "User not found" });
        let cart = result[0].cartData ? JSON.parse(result[0].cartData) : {};
        if(!cart[req.body.itemId]) cart[req.body.itemId] = 1;
        else cart[req.body.itemId] += 1;

        db.query('UPDATE user SET cartData = ? WHERE id = ?', [JSON.stringify(cart), userId], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Failed to item add to cart" });

            res.status(200).json({ message: "Added To Cart", cart });
        });
    })
}

export const removeToCart = async (req , res) => {
    const userId = req.body.userId;
    db.query('SELECT * FROM user WHERE id = ?', [userId] , async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "User not found" });
        let cart = result[0].cartData ? JSON.parse(result[0].cartData) : {};
        if(cart[req.body.itemId] > 0) cart[req.body.itemId] -= 1;

        db.query('UPDATE user SET cartData = ? WHERE id = ?', [JSON.stringify(cart), userId], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Failed to update cart" });

            res.status(200).json({ message: "Added To Cart", cart });
        });
    });
}

export const getCart = async (req , res) => {
    const userId = req.body.userId;
    db.query('SELECT cartData FROM user WHERE id = ?', [userId] , async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "User not found" });
        let cart = result[0].cartData ? JSON.parse(result[0].cartData) : {};
        res.status(200).json({ message: "Added To Cart", cart });
    });
}