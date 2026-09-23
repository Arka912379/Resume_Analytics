import "./configs/env.js";

import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded())
app.use(express.static("public"))

import errorHandler from "./middlewares/error.middleware.js";
import AuthRouter from "./routes/auth.route.js";
import resumeRouter from "./routes/resume.route.js";
import historyRouter from "./routes/history.route.js";
import dashbordRouter from "./routes/dashbord.route.js";
import jobDescriptionAnalysisRouter from "./routes/jobDescriptionAnalysis.route.js"

app.use("/api/v1/auth",AuthRouter)
app.use("/api/v1/resume",resumeRouter)
app.use("/api/v1/history",historyRouter)
app.use("/api/v1/dashboard",dashbordRouter)
app.use("/api/v1/job-description-analysis", jobDescriptionAnalysisRouter)

app.use(errorHandler)

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to AddaLove API"
    })
})

export default app;