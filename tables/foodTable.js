import db from "../config/db.js";

const createFoodTable = () => {
    const checkTableQuery = `
        SELECT COUNT(*) AS count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'food'
    `;

    db.query(checkTableQuery, (err, results) => {
        if (err) {
            console.error("Error checking table existence:", err);
            return;
        }

        const tableExists = results[0].count > 0;

        if (!tableExists) {
            console.log("Food table does not exist. Creating now...");

            const createTableQuery = `
                CREATE TABLE food (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    image VARCHAR(255),
                    category VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error("Error creating food table:", err);
                } else {
                    console.log("Food table created successfully!");
                }
            });
        } else {
            console.log("Food table already exists. No action needed.");
        }
    });
};

export default createFoodTable; 
