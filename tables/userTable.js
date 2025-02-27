import db from "../config/db.js";

const createUserTable = () => {
    const checkTableQuery = `
        SELECT COUNT(*) AS count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'user'
    `;

    db.query(checkTableQuery, (err , results) => {
        if (err) {
            console.error("Error checking table existence:", err);
            return;
        }

        const tableExists = results[0].count > 0;

        if (!tableExists){
            console.log("Food table does not exist. Creating now...");

            const createTableQuery = `
                CREATE TABLE user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                cartData TEXT DEFAULT NULL
                )
            `;

            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error("Error creating user table:", err);
                } else {
                    console.log("User table created successfully!");
                }
            });
        }else{
            console.log("User table already exists. No action needed.");
        }
    })
}

export default createUserTable;