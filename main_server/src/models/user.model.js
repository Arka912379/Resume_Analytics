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
    userBio: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,

    },
    apiCallStatus: {
        type: Boolean,
        default: false,
        get: function () {
            const now = new Date();

            // Create a reference for 12:00 PM today
            const noonToday = new Date(now);
            noonToday.setHours(12, 0, 0, 0);

            // If the current time is past 12:00 PM, return false. Otherwise, true.
            return now < noonToday;
        }
    },
    

}, { timestamps: true },{toJSON: { getters: true }, 
  toObject: { getters: true } })

const User = mongoose.model("User", userSchema);
export default User;

/*
    image
    name
    email
    gender
    bio
    mobile no
    dob
    password
*/