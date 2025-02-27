import db from "../config/db.js";

const createOrderTable = () => {
    const checkOrderQuery = `
        SELECT COUNT(*) AS count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'orders'
    `;

    db.query(checkOrderQuery, (err , results) => {
        if (err) {
            console.error("Error checking table existence:", err);
            return;
        }

        const tableExists = results[0].count > 0;

        if (!tableExists){
            console.log("Order table does not exist. Creating now...");

            const createOrderQuery = `
                CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(255) NOT NULL,
                items TEXT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                address TEXT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Food Processing',
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment BOOLEAN NOT NULL DEFAULT FALSE
            )
            `;

            db.query(createOrderQuery, (err) => {
                if (err) {
                    console.error("Error creating order table:", err);
                } else {
                    console.log("Order table created successfully!");
                }
            });
        }else{
            console.log("Order table already exists. No action needed.");
        }
    })
}

export default createOrderTable;