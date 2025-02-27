import express from "express";
import multer from "multer";
import { addFood , listFood , deleteFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req,file,cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
});

const upload = multer({ storage })

foodRouter.post('/add', upload.single("image"), addFood);
foodRouter.get('/list', listFood);
foodRouter.delete('/delete', deleteFood);

export default foodRouter;