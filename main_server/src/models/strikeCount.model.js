import mongoose from "mongoose";

const strikeCountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    strikeStartDate: {
        type: Date,
        default: Date.now,
        required: true
    },

    strikeCount: {
        type: Number,
        default: 0,
        required: true
    }
}, { timestamps: true });

const StrikeCount = mongoose.model("StrikeCount", strikeCountSchema);

export default StrikeCount;