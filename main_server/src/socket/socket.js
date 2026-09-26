import { Server } from 'socket.io';
import http from "http";
import app from "../app.js";
import { socketAuthMiddleware } from "../middlewares/socket.middleware.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import axios from 'axios';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

io.use(socketAuthMiddleware);

const AI_SERVER_URL = process.env.AI_SERVER_URL + '/api/v2/interview';

io.on('connection', (socket) => {
    const userId = socket.user._id;

    socket.on('start-interview', async () => {
        try {
            const generateResponse = await axios.post(`${AI_SERVER_URL}/generate/${userId}`);
            const interview = generateResponse.data.data.interview;

            const room = `interview:${interview._id}`;
            socket.join(room);

            socket.currentInterviewId = interview._id;

            const nextQuestionResponse = await axios.post(
                `${AI_SERVER_URL}/${interview._id}/next-question`
            );
            const questionData = nextQuestionResponse.data.data;

            io.to(room).emit('interview-started', { interviewId: interview._id });
            io.to(room).emit('question', questionData);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('submit-answer', async ({ interviewId, message }) => {
        try {
            const room = `interview:${interviewId}`;

            const respondResponse = await axios.post(`${AI_SERVER_URL}/${interviewId}/respond`, {
                message,
            });
            const responseData = respondResponse.data.data;

            const nextQuestionResponse = await axios.post(
                `${AI_SERVER_URL}/${interviewId}/next-question`
            );
            const questionData = nextQuestionResponse.data.data;

            io.to(room).emit('answer-result', responseData);

            if (questionData.done) {
                io.to(room).emit('all-questions-done');
            } else {
                io.to(room).emit('question', questionData);
            }
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('finish-interview', async ({ interviewId }) => {
        try {
            const room = `interview:${interviewId}`;

            const evaluateResponse = await axios.post(`${AI_SERVER_URL}/${interviewId}/evaluate`);
            const result = evaluateResponse.data.data;

            socket.currentInterviewId = null;

            io.to(room).emit('interview-result', result);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on("connect_error", (err) => {
        console.log("Connection error:", err);
    });

    socket.on("disconnect", async () => {
        console.log("Disconnected:", userId);

        if (socket.currentInterviewId) {
            try {
                const room = `interview:${socket.currentInterviewId}`;
 
                const evaluateResponse = await axios.post(
                    `${AI_SERVER_URL}/${socket.currentInterviewId}/evaluate`
                );
                const result = evaluateResponse.data.data;
 
                io.to(room).emit('interview-result', result);
            } catch (error) {
                console.log('Auto-finish on disconnect failed:', error.message);
            }
        }
    });
})

export { io, server };