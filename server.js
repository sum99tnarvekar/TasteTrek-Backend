import cors from "cors";
import path from "path";
import "dotenv/config.js";
import express from "express";
import { fileURLToPath } from 'url';
import foodRouter from "./routes/foodRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRouter.js";
import createFoodTable from "./tables/foodTable.js";
import createUserTable from "./tables/userTable.js";
import createOrderTable from "./tables/orderTable.js";
import orderRouter from "./routes/orderRouter.js";


const app = express();
const port = 4000;


app.use(express.json());
app.use(cors());

createFoodTable();
createUserTable();
createOrderTable();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api/food', foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/' , (req , res) => {
    res.send("API Working")
});

app.listen(port , () => {
    console.log(`Your server is running on ${port}`);
})