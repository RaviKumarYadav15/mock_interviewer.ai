import express from 'express';
import cors from 'cors';
import dotenv from "dotenv"
import connectDb from './config/connectDb.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
dotenv.config()

const app = express();
app.use(cors({
    origin:process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)

const PORT = process.env.PORT || 6000
// app.get("/",(req, res) => {
//     return res.json({message: "Server Started"})
// });
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
    connectDb()
})