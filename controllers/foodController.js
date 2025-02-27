import fs from "fs";
import db from "../config/db.js";

export const addFood = (req, res) => {
    const { name, description, price, category } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !description || !price || !image || !category) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sqlQuery = "INSERT INTO food (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)";
    const values = [name, description, price, image, category];

    db.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error("Error adding food:", err);
            return res.status(500).json({ error: "Failed to add food item" });
        }
        res.status(200).json({ message: "Food item added successfully", foodId: result.insertId });
    });
};


export const listFood = (req , res) => {
    const sqlQuery = "SELECT * FROM food";

    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.error("Error fetching food items:", err);
            return res.status(500).json({ error: "Failed to fetch food items" });
        }
        res.status(200).json(result);
    });
};

export const deleteFood = (req , res) => {
    const { id } = req.query;
    const getImageQuery = "SELECT image FROM food WHERE id = ?";
    const deleteSqlQuery = "DELETE FROM food WHERE id = ?";

    db.query(getImageQuery, [id], (err, result) => {
        if (err) {
            console.error("Error fetching food image:", err);
            return res.status(500).json({ error: "Failed to fetch food image" });
        }
        console.log(result);
        if (result.length === 0) {
            return res.status(404).json({ error: "Food item not found" });
        }

        const imagePath = `uploads/${result[0].image}`;

        db.query(deleteSqlQuery, [id], (err) => {
            if (err) {
                console.error("Error deleting food item:", err);
                return res.status(500).json({ error: "Failed to delete food item" });
            }

            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting image file:", unlinkErr);
                }
            });

            res.status(200).json({ message: "Food item deleted successfully" });
        });
    });
}