// Import express
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import db from "./config/Database.js";
import usersRouter from "./routes/users.js";
// import Users from "./models/User.js";

dotenv.config();

// mengambil fungsi express
const app = express();

// Lakukan koneksi
try {
    await db.authenticate();
    console.log("Database connected...");  

    // // Membuat table if not exist
    // await Users.sync();
} catch (error) { 
    console.error(error);
}

// Terima data format json
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin:'http://localhost:3000'
}));

// Prefix route
app.use('/users', usersRouter);

app.listen(5000, ()=> console.log('Server running on port 5000'));