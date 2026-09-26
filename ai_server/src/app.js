import "./configs/env.js";

import express from "express";
import cors from "cors"

const app = express();

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))

import interviewRouter from "./routes/interview.route.js"
import jobDescriptionAnalysisRouter from "./routes/jobDescriptionAnalysis.route.js"
import errorHandler from "./middlewares/error.middleware.js";

app.use("/api/v2/interview", interviewRouter)
app.use("/api/v2/job-description-analysis", jobDescriptionAnalysisRouter)
app.use(errorHandler)

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the AI Server" });
});

export default app;