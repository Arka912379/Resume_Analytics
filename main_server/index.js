import app from "./src/app.js";
import "./src/configs/env.js";

import connectDB from "./src/db/db.js";
import http from 'http';
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

connectDB().then(() => {
    server.on("error", (err)=>{
        console.log(err)
    })
    server.listen(PORT,()=>{
        console.log("server running",PORT)
    })
}).catch((err) => {
    console.log("connection failed", err?.message)
})