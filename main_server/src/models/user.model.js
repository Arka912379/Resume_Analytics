import mongoose from "mongoose"
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true

    },
    userBio:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,

    },

},{ timestamps: true })

const User = mongoose.model("User", userSchema);
export default User;