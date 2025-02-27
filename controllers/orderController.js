import db from "../config/db.js";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const placeOrder = async (req , res) => {
    const userId = req.body.userId;
    const {items , amount , address} = req.body;
    if (!userId || !items || !amount || !address) return res.status(400).json({ error: "All fields are required" });
    const sqlQuery = `INSERT INTO orders (userId, items, amount, address) VALUES (?, ?, ?, ?)`;

    db.query(sqlQuery, [userId, JSON.stringify(items), amount, JSON.stringify(address)], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to create order" });
        }
        const orderId = result.insertId;
        // res.status(201).json({message: "Order placed successfully" , orderId: result.insertId});
        db.query('UPDATE user SET cartData = ? WHERE id = ?', [null, userId], async (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Failed to item add to cart" });
            // res.status(200).json({ message: "Added To Cart", cart });
            const lineItems = items.map((item) => ({
                price_data: {
                    currency: "aud",
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.quantity 
            }));
            
            lineItems.push({
                price_data: {
                    currency: "aud",
                    product_data: {
                        name: "Delivery Charges"
                    },
                    unit_amount: 2 * 100
                },
                quantity: 1
            });
            
            const session = await stripe.checkout.sessions.create({
                line_items: lineItems,
                mode: 'payment',
                success_url: `http://localhost:5173/verify?success=true&orderId=${orderId}`,
                cancel_url: `http://localhost:5173/verify?success=false&orderId=${orderId}`
            });            
            res.json({success : 'true' , session_url : session.url})
        });
    });
}

export const verifyOrder = async (req , res) => {
    const { orderId , success } = req.body;
    try {
        if(success == "true"){
            db.query("SELECT payment FROM orders WHERE id = ?", [orderId], async (err, result) => {
                if (err) return res.status(500).json({ error: "Internal server error" });
                if (result.length === 0) return res.status(400).json({ error: "Order not exists with this Order Id" });
                db.query('UPDATE orders SET payment = ? WHERE id = ?', [true, orderId], (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: "Failed to update Payment status of order" });
                    res.status(200).json({ message: "Payment Status Paid"});
                });
            });
        }else {
            db.query("SELECT * FROM orders WHERE id = ?", [orderId], async (err, result) => {
                if (err) return res.status(500).json({ error: "Internal server error" });
                if (result.length === 0) return res.status(400).json({ error: "Order not exists with this Order Id" });
                db.query('DELETE FROM orders WHERE id = ?', [orderId], (err) => {
                    if (err) return res.status(500).json({ error: "Failed to delete order" });
                    res.status(500).json({ message: "Payment Status Unpaid" });
                });
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

export const userOrders = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) return res.status(400).json({ error: "Not found any order for this user" });
        db.query("SELECT * FROM orders WHERE userId = ?", [userId], (err, result) => {
            if (err) return res.status(500).json({ error: "Internal server error" });
            if (result.length === 0) return res.status(400).json({ error: "Order not exists with this user" });
            res.status(200).json({ orders: result });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

export const listOrders = async (req, res) => {
    try {
        db.query("SELECT * FROM orders", (err, result) => {
            if (err) return res.status(500).json({ error: "Internal server error" });
            if (result.length === 0) return res.status(400).json({ error: "Somthing went wrong in orders fetching" });
            res.status(200).json({ result });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

export const updateOrderStatus = async (req , res) => {
    const { orderId , status } = req.body;
    try {
        db.query("SELECT status FROM orders WHERE id = ?",[orderId], (err, result) => {
            if (err) return res.status(500).json({ error: "Internal server error" });
            if (result.length === 0) return res.status(400).json({ error: "Order not found" });
            db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: "Failed to update order status" });
                res.status(200).json({ message: "Order status updated successfully" });
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}
